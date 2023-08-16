import { telegramm } from 'env';

import { OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';

import { UnsubscribeExeption } from '../../errors';
import { Context } from '../../interfaces/context.interface';

import { EventService } from 'src/core/event/event.service';
import { UserService } from 'src/core/user/user.service';
import { NotificationScene } from '../notification/notification.scene';

import { actionButtons } from '../../buttons/actions.button';
import { weatherButtons } from './buttons';

import { CreateWeatherNotificationParams, WeatherDto } from './dto';

import { SceneEnum } from '../../enums/scene.enum';
import {
  WeatherActionEnum,
  WeatherContextStepEnum,
  WeatherPhrases,
} from './enums';

import { compareTimeWithCurrent, dateToTimeDto, formatTime } from '../utils';
import {
  errorHandlerResponse,
  getUserEvent,
  getWeather,
  handleGetWeatherInput,
  handleSubscriptionInput,
  saveUser,
  sendWeatherApiRequest,
} from './utils';

@Scene(SceneEnum.weatherScene)
export class WeatherScene implements OnModuleInit {
  constructor(
    private readonly eventService: EventService,
    private readonly notificationService: NotificationScene,
    private readonly userService: UserService,
  ) {}

  private stepHandlers = {
    getWeather: handleGetWeatherInput,
    subscription: this.subscription,
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
          const weather = await sendWeatherApiRequest({ q: city.name });
          usersWeather.set(user.telegrammID, weather);
        }

        await this.notificationService.addCronJob(
          cronName,
          time,
          this.handleCron,
          usersWeather,
          true,
        );
      }
    }

    console.log('weather module init notification');
    this.notificationService.getCrons();
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

    ctx.session.__scenes.state.sessionData = {};
    ctx.session.__scenes.state.sessionData.weather = {};
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

      const event = await getUserEvent(telegrammID, this.userService);
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
      await errorHandlerResponse(ctx, error);
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
        ctx.session.__scenes.state.sessionData.weather;

      const handler = this.stepHandlers[step];
      if (handler) {
        await handler.call(this, ctx, message, weather);
      }
    } catch (error) {
      await errorHandlerResponse(ctx, error);
    }
  }

  private async subscription(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
    weather: CreateWeatherNotificationParams,
  ) {
    const telegrammID = ctx.chat.id;
    const event = await getUserEvent(telegrammID, this.userService);
    await handleSubscriptionInput(ctx, message, weather, event);
  }

  private async saveWeatherAndExit(@Ctx() ctx: Context) {
    try {
      const { event, city, user } = await saveUser(ctx, this.userService);

      if (compareTimeWithCurrent(event.time)) {
        const userWeather = new Map();
        const weather = await getWeather(ctx, city.name);

        userWeather.set(user.telegrammID, weather);

        await this.notificationService.addCronJob(
          `${event.id}`,
          event.time,
          this.handleCron,
          userWeather,
          true,
        );
      }

      await ctx.sendMessage(
        WeatherPhrases.notificationSet(formatTime(dateToTimeDto(event.time))),
        actionButtons(),
      );
      await ctx.scene.leave();
    } catch (error) {
      await errorHandlerResponse(ctx, error);
    }
  }
}
