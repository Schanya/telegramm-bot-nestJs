import { BadRequestException, OnModuleInit } from '@nestjs/common';
import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { EventService } from 'src/core/event/event.service';
import { Telegraf } from 'telegraf';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { weatherButtons } from '../buttons/weather.button';
import { Context } from '../interfaces/context.interface';
import { WeatherDto, WeatherParamsDto } from './dto/weather.dto';
import { SceneEnum } from './enums/scene.enum';
import { axiosDownload } from './help/httpRequest';
import { compareTimeWithCurrent } from './help/time-methods';
import { NotificationService } from './schedule.service';

@Scene(SceneEnum.weatherScene)
export class WeatherService implements OnModuleInit {
  constructor(
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    const events = await this.eventService.findAll({});

    for (const event of events) {
      const cronName = `notification for event ${event.id}`;
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
    const bot = new Telegraf(process.env.TELEGRAMM_BOT_TOKEN);
    for (const [id, weather] of usersWeather) {
      await bot.telegram.sendMessage(
        id,
        `Погода: ${weather.description}\nТемпература: ${weather.temperature}°C`,
      );
    }
  }

  @SceneEnter()
  async startWeatherScene(@Ctx() ctx: Context) {
    await ctx.sendMessage('Выберите действие', weatherButtons());
  }

  @Action('/city')
  async cityAction(@Ctx() ctx: Context) {
    ctx.editMessageText(
      'Введите название города, погоду которого хотите знать',
    );
    ctx.session.__scenes.type = 'weather';
  }

  @Action('/subscription')
  async subscriptionAction(@Ctx() ctx: Context) {
    await ctx.editMessageText(
      'Введите название города, погоду которого хотите знать',
    );

    ctx.session.__scenes.type = 'subscription';
  }

  async getWeather(city: string) {
    try {
      const params: WeatherParamsDto = {
        q: city,
        lang: 'ru',
        appid: process.env.WEATHER_KEY,
        units: 'metric',
      };
      const { data } = await axiosDownload(process.env.WEATHER_URL, params);

      const cityName = data.name;
      const weatherDescription = data['weather'][0].description;
      const temperature = Number(data['main'].temp);

      const result: WeatherDto = {
        cityName,
        description: weatherDescription,
        temperature,
      };

      return result;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @On('text')
  async getCity(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    try {
      const messageText = message.text;
      let { cityName, description, temperature } = await this.getWeather(
        messageText,
      );

      switch (ctx.session.__scenes.type) {
        case 'weather': {
          await ctx.sendMessage(
            `Погода: ${description}\nТемпература: ${temperature}°C`,
          );

          await ctx.scene.leave();

          break;
        }
        case 'subscription': {
          ctx.state.city = cityName;
          ctx.state.evenType = 'weather';
          ctx.scene.enter(SceneEnum.timeScene, ctx.state);

          break;
        }
      }
    } catch (e) {
      ctx.sendMessage('В названии города что-то не так, повторите ввод');
    }
  }
}
