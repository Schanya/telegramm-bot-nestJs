import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { CreateCityDto } from 'src/core/city/dto/create-city.dto';
import { CreateEventDto } from 'src/core/event/dto/create-event.dto';
import { CreateUserDto } from 'src/core/user/dto/create-user.dto';
import { UserDataDto } from 'src/core/user/dto/user-data.dto';
import { UserService } from 'src/core/user/user.service';
import { callbackQuery } from 'telegraf/filters';
import { Message } from 'telegraf/typings/core/types/typegram';
import { actionButtons } from '../buttons/actions.button';
import { timeButtons } from '../buttons/time.button';
import { Context } from '../interfaces/context.interface';
import { TIME } from './сonstants/time.constants';
import { TimeDto } from './dto/time.dto';
import { TimePhrases } from './enums/phrases/time.phrases';
import { SceneEnum } from './enums/scene.enum';
import {
  compareTimeWithCurrent,
  formatTime,
  parseTime,
} from './utils/time-methods';
import { NotificationService } from './schedule.service';
import { TimeActionType } from './types/time-action.type';
import { WeatherService } from './weather.service';

@Scene(SceneEnum.timeScene)
export class TimeService {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly weatherService: WeatherService,
  ) {}

  @SceneEnter()
  async startTimeScene(@Ctx() ctx: Context) {
    const currentDate = new Date();
    const initialTime = {
      hours: currentDate.getHours(),
      minutes: currentDate.getMinutes(),
    };

    await ctx.reply(TimePhrases.start);
    await ctx.reply(
      TimePhrases.currentTime(formatTime(initialTime)),
      timeButtons(),
    );
  }

  @On('callback_query')
  async timeButtonsHandler(@Ctx() ctx: Context) {
    if (ctx.has(callbackQuery('data'))) {
      const action = ctx.callbackQuery.data as TimeActionType;
      const message = ctx.callbackQuery.message as Message.TextMessage;
      const currentTime = parseTime(message.text);

      await this.handleTimeAction(action, currentTime, ctx);
    }
  }

  async handleTimeAction(
    action: TimeActionType,
    currentTime: TimeDto,
    @Ctx() ctx: Context,
  ) {
    ctx.answerCbQuery();
    switch (action) {
      case 'increaseHours':
        currentTime.hours = (currentTime.hours + TIME.hourStep) % TIME.hours;
        break;
      case 'decreaseHours':
        currentTime.hours =
          (currentTime.hours - TIME.hourStep + TIME.hours) % TIME.hours;
        break;
      case 'increaseMinutes':
        currentTime.minutes =
          (currentTime.minutes + TIME.minuteStep) % TIME.minutes;
        if (!currentTime.minutes) {
          currentTime.hours = (currentTime.hours + TIME.hourStep) % TIME.hours;
        }
        break;
      case 'decreaseMinutes':
        currentTime.minutes =
          (currentTime.minutes - TIME.minuteStep + TIME.minutes) % TIME.minutes;
        if (currentTime.minutes === TIME.minuteLimit) {
          currentTime.hours =
            (currentTime.hours - TIME.hourStep + TIME.hours) % TIME.hours;
        }
        break;
      case 'done':
        await this.handleDoneAction(ctx, currentTime);
        break;
      default:
        return;
    }

    this.updateMessage(ctx, currentTime);
  }

  async handleDoneAction(@Ctx() ctx: Context, currentTime: TimeDto) {
    try {
      const cityInfo: CreateCityDto = { name: ctx.session.__scenes.state.city };
      const userInfo: CreateUserDto = {
        name: ctx.callbackQuery.from.first_name,
        telegrammID: ctx.callbackQuery.from.id,
      };
      const eventInfo: CreateEventDto = {
        time: new Date(0, 0, 0, currentTime.hours, currentTime.minutes),
        type: ctx.session.__scenes.state.evenType,
      };

      const userData: UserDataDto = { cityInfo, eventInfo, userInfo };

      await this.userService.checkUserEvents(
        userInfo.telegrammID,
        eventInfo.type,
      );

      const response = await this.userService.saveUserWithData(userData);

      if (compareTimeWithCurrent(eventInfo.time)) {
        const userWeather = new Map();
        const weather = await this.weatherService.getWeather(
          response.city.name,
        );

        userWeather.set(response.user.telegrammID, weather);

        await this.notificationService.addCronJob(
          `${response.event.id}`,
          response.event.time,
          this.weatherService.handleCron,
          userWeather,
        );
      }

      ctx.sendMessage(
        TimePhrases.notificationSet(formatTime(currentTime)),
        actionButtons(),
      );
      ctx.scene.leave();
    } catch (error) {
      ctx.sendMessage(error.message);
    }
  }

  updateMessage(@Ctx() ctx: Context, currentTime: TimeDto) {
    ctx
      .editMessageText(
        TimePhrases.currentTime(formatTime(currentTime)),
        timeButtons(),
      )
      .catch(() => {});
  }
}
