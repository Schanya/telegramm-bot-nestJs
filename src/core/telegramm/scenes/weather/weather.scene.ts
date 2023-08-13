import {
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpStatusCode } from 'axios';
import { telegramm, weather } from 'env';
import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Event } from 'src/core/event/event.model';
import { EventService } from 'src/core/event/event.service';
import { EventType } from 'src/core/event/types/event.type';
import { UserService } from 'src/core/user/user.service';
import { Telegraf } from 'telegraf';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { actionButtons } from '../../buttons/actions.button';
import { SceneEnum } from '../../enums/scene.enum';
import { Context } from '../../interfaces/context.interface';
import { NotificationScene } from '../notification/notification.scene';

import {
  axiosDownload,
  compareTimeWithCurrent,
  dateToTimeDto,
  formatTime,
} from '../utils';
import {
  InvalidInputExeption,
  SubscriptionExeption,
  UnsubscribeExeption,
} from '../../errors';

import {
  WeatherActionEnum,
  WeatherContextStepEnum,
  WeatherPhrases,
  WeatherRequestParamsConstants,
} from './enums';
import { weatherButtons } from './buttons/weather.button';
import { CreateWeatherNotificationParams, WeatherDto } from './dto/weather.dto';

@Scene(SceneEnum.weatherScene)
export class WeatherScene implements OnModuleInit {
  constructor(
    private readonly eventService: EventService,
    private readonly notificationService: NotificationScene,
    private readonly userService: UserService,
  ) {}

  private stepHandlers = {
    getWeather: this.handleGetWeatherInput,
    subscription: this.handleSubscriptionInput,
  };

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
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
        WeatherPhrases.getWeatherInfo(
          weather.cityName,
          weather.description,
          weather.temperature,
        ),
      );
    }
  }

  @SceneEnter()
  async startWeatherScene(@Ctx() ctx: Context) {
    if (ctx.state?.previousSceneData) {
      return await this.saveWeatherAndExit(ctx);
    }

    ctx.session.__scenes.state.weather = {};
    await ctx.sendMessage(WeatherPhrases.start, weatherButtons());
  }

  @Action(WeatherActionEnum.menu)
  async menu(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.sendMessage('Главное меню', actionButtons());

    await ctx.scene.leave();
  }

  @Action(WeatherActionEnum.getWeather)
  async cityAction(@Ctx() ctx: Context) {
    ctx.session.__scenes.step = WeatherContextStepEnum.getWeather;

    await ctx.answerCbQuery();
    await ctx.sendMessage(WeatherPhrases.getWeather);
  }

  @Action(WeatherActionEnum.subscription)
  async subscriptionAction(@Ctx() ctx: Context) {
    ctx.session.__scenes.step = WeatherContextStepEnum.subscription;

    await ctx.answerCbQuery();
    await ctx.sendMessage(WeatherPhrases.getSubscription);
  }

  @Action(WeatherActionEnum.unsubscribe)
  async unsubscribeAction(@Ctx() ctx: Context) {
    try {
      await ctx.answerCbQuery();
      const telegrammID = ctx.callbackQuery.from.id;

      const user = await this.userService.findBy({ telegrammID });
      if (!user) {
        throw new UnsubscribeExeption(WeatherPhrases.unsubscribeNotification);
      }

      const event = await this.getUserEvent(telegrammID);
      if (!event) {
        throw new UnsubscribeExeption(WeatherPhrases.unsubscribeNotification);
      }

      const city = await user.$get('city');

      this.notificationService.deleteCron(`${event.id}`);
      await this.eventService.delete(event.id);

      await ctx.sendMessage(
        WeatherPhrases.notificationDeleted(
          city.name,
          formatTime({
            hours: event.time.getHours(),
            minutes: event.time.getMinutes(),
          }),
        ),
        actionButtons(),
      );
      await ctx.scene.leave();
    } catch (error) {
      if (error.name == 'UnsubscribeExeption') {
        await ctx.sendMessage(error.message);
        return await ctx.scene.reenter();
      }
      await ctx.sendMessage(error.message);
    }
  }

  @On('text')
  async handleInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    try {
      const step = ctx.session.__scenes.step;
      const weather: CreateWeatherNotificationParams =
        ctx.session.__scenes.state.weather;

      const handler = this.stepHandlers[step];
      if (handler) {
        await handler.call(this, ctx, message, weather);
      }
    } catch (error) {
      if (error.name == 'SubscriptionExeption') {
        await ctx.sendMessage(error.message);
        return await ctx.scene.reenter();
      }
      await ctx.sendMessage(error.message);
    }
  }

  private async handleGetWeatherInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    const messageText = message.text;
    const { cityName, description, temperature } = await this.getWeather(
      messageText,
    );

    await ctx.sendMessage(
      WeatherPhrases.getWeatherInfo(cityName, description, temperature),
      actionButtons(),
    );

    await ctx.scene.leave();
  }

  private async handleSubscriptionInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
    weather: CreateWeatherNotificationParams,
  ) {
    const telegrammID = ctx.chat.id;
    const event = await this.getUserEvent(telegrammID);

    const messageText = message.text;
    const { cityName } = await this.getWeather(messageText);

    if (event) {
      throw new SubscriptionExeption(
        WeatherPhrases.subscriptionExeption(
          cityName,
          formatTime(dateToTimeDto(event.time)),
        ),
      );
    }

    weather.cityName = cityName;

    ctx.state.previousSceneData = JSON.stringify(weather);
    ctx.state.previousScene = SceneEnum.weatherScene;

    await ctx.scene.leave();
    await ctx.scene.enter(SceneEnum.timeScene, ctx.state);
  }

  private async saveWeatherAndExit(@Ctx() ctx: Context) {
    const previousSceneData = JSON.parse(ctx.state.previousSceneData);

    const cityInfo = { name: previousSceneData.cityName };

    const { first_name: name, id: telegrammID } = ctx.callbackQuery.from;
    const userInfo = { name, telegrammID };

    const { time } = previousSceneData;
    const type: EventType = 'weather';
    const eventInfo = {
      time: new Date(0, 0, 0, time.hours, time.minutes),
      type,
    };

    const userData = { cityInfo, eventInfo, userInfo };

    const response = await this.userService.saveUserWithData(userData);

    if (compareTimeWithCurrent(eventInfo.time)) {
      const userWeather = new Map();
      const weather = await this.getWeather(response.city.name);

      userWeather.set(response.user.telegrammID, weather);

      await this.notificationService.addCronJob(
        `${response.event.id}`,
        response.event.time,
        this.handleCron,
        userWeather,
      );
    }

    await ctx.sendMessage(
      WeatherPhrases.notificationSet(formatTime(time)),
      actionButtons(),
    );
    await ctx.scene.leave();
  }

  private async getWeather(city: string) {
    try {
      if (/\d+/.test(city)) {
        throw new InvalidInputExeption(WeatherPhrases.cityNameExeption);
      }

      const params = { q: city };
      const { data } = await axiosDownload(weather.url, {
        ...params,
        ...WeatherRequestParamsConstants,
      });

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
      if (
        error.response.status == HttpStatusCode.NotFound ||
        error instanceof NotFoundException
      ) {
        throw new InvalidInputExeption(WeatherPhrases.cityNameExeption);
      }
      throw new BadRequestException(WeatherPhrases.sendError);
    }
  }

  private async getUserEvent(telegrammID: number): Promise<Event> {
    const user = await this.userService.findBy({ telegrammID });

    if (user) {
      const events = await user.$get('events', { type: 'weather' });
      const event = events[0];

      return event;
    }
  }
}
