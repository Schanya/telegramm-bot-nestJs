import { BadRequestException, OnModuleInit } from '@nestjs/common';
import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { EventService } from 'src/core/event/event.service';
import { Telegraf } from 'telegraf';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { weatherButtons } from '../buttons/weather.button';
import { Context } from '../interfaces/context.interface';
import { WeatherDto, WeatherParamsDto } from './dto/weather.dto';
import { SceneEnum } from './enums/scene.enum';
import { axiosDownload } from './utils/httpRequest';
import { compareTimeWithCurrent, formatTime } from './utils/time-methods';
import { NotificationService } from './schedule.service';
import { actionButtons } from '../buttons/actions.button';
import { WeatherPhrases } from './enums/phrases/weather.phrases';
import { UserService } from 'src/core/user/user.service';
import { telegramm, weather } from 'env';

@Scene(SceneEnum.weatherScene)
export class WeatherService implements OnModuleInit {
  constructor(
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    const events = await this.eventService.findAll({});

    for (const event of events) {
      const cronName = `${event.id}`;
      const time = event.time;

      if (compareTimeWithCurrent(time)) {
        const users = await event.$get('users');
        const usersWeather = new Map();

        for (const user of users) {
          const city = await user.$get('city');
          const weather = await this.getWeather(city.name);
          usersWeather.set(user.telegrammID, weather);
        }

        await this.notificationService.addCronJob(
          cronName,
          time,
          this.handleCron,
          usersWeather,
        );
      }
    }
  }

  async handleCron(usersWeather: Map<number, WeatherDto>) {
    const bot = new Telegraf(telegramm.token);
    for (const [id, weather] of usersWeather) {
      await bot.telegram.sendMessage(
        id,
        WeatherPhrases.getWeatherInfo(weather.description, weather.temperature),
      );
    }
  }

  @SceneEnter()
  async startWeatherScene(@Ctx() ctx: Context) {
    await ctx.sendMessage(WeatherPhrases.start, weatherButtons());
  }

  @Action('/city')
  async cityAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.sendMessage(WeatherPhrases.getWeather);
    ctx.session.__scenes.step = 'weather';
  }

  @Action('/subscription')
  async subscriptionAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.sendMessage(WeatherPhrases.getSubscription);

    ctx.session.__scenes.step = 'subscription';
  }

  @Action('/unsubscribe')
  async unsubscribeAction(@Ctx() ctx: Context) {
    try {
      await ctx.answerCbQuery();
      const telegrammID = ctx.callbackQuery.from.id;
      const user = await this.userService.findBy({ telegrammID });

      if (!user) {
        throw new BadRequestException(WeatherPhrases.unsubscribeNotification);
      }

      const city = await user.$get('city');

      const events = await user.$get('events', { type: 'weather' });
      const event = events[0];

      if (!event) {
        throw new BadRequestException(WeatherPhrases.unsubscribeNotification);
      }

      this.notificationService.deleteCron(`${event.id}`);

      await this.eventService.delete(event.id);

      ctx.sendMessage(
        WeatherPhrases.notificationDeleted(
          city.name,
          formatTime({
            hours: event.time.getHours(),
            minutes: event.time.getMinutes(),
          }),
        ),
        actionButtons(),
      );
      ctx.scene.leave();
    } catch (error) {
      ctx.sendMessage(error.message);
    }
  }

  async getWeather(city: string) {
    try {
      const params = new WeatherParamsDto(city);
      const { data } = await axiosDownload(weather.url, params);

      const cityName = data.name;
      const weatherDescription = data.weather[0].description;
      const temperature = Number(data.main.temp);

      const result: WeatherDto = {
        cityName,
        description: weatherDescription,
        temperature,
      };

      return result;
    } catch (error) {
      throw new BadRequestException(WeatherPhrases.cityNameExeption);
    }
  }

  @On('text')
  async getCity(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    try {
      if (!ctx.session.__scenes.step) {
        throw new BadRequestException(WeatherPhrases.undefinedActionType);
      }

      const messageText = message.text;

      let { cityName, description, temperature } = await this.getWeather(
        messageText,
      );

      switch (ctx.session.__scenes.step) {
        case 'weather': {
          await ctx.sendMessage(
            WeatherPhrases.getWeatherInfo(description, temperature),
            actionButtons(),
          );

          await ctx.scene.leave();

          break;
        }
        case 'subscription': {
          ctx.state.city = cityName;
          ctx.state.evenType = 'weather';
          await ctx.scene.leave();
          await ctx.scene.enter(SceneEnum.timeScene, ctx.state);

          break;
        }
      }
    } catch (error) {
      await ctx.sendMessage(WeatherPhrases.sendError + error.message);
    }
  }
}
