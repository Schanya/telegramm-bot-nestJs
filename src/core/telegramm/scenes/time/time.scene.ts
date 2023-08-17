import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { callbackQuery } from 'telegraf/filters';
import { Message } from 'telegraf/typings/core/types/typegram';
import { SceneEnum } from '../../enums/scene.enum';
import { Context } from '../../interfaces/context.interface';
import { formatTime, parseTime } from '../utils/time-methods';
import { timeButtons } from './buttons/time.button';
import { TimeDto } from './dto/time.dto';
import { TimeActionEnum } from './enums/time-action.enum';
import { TIME } from './enums/time.constants';
import { TimePhrases } from './enums/time.phrases';
import { TimeActionType } from './types/time-action.type';

@Scene(SceneEnum.timeScene)
export class TimeScene {
  constructor() {}

  @SceneEnter()
  async startTimeScene(@Ctx() ctx: Context) {
    ctx.session.__scenes.state.previousScene = ctx.state.previousScene;
    ctx.session.__scenes.state.previousSceneData = ctx.state.previousSceneData;
    ctx.session.__scenes.step = ctx.step;

    const currentDate = new Date();

    currentDate.setHours(currentDate.getHours() + 3);

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
      case TimeActionEnum.increaseHours:
        currentTime.hours = (currentTime.hours + TIME.hourStep) % TIME.hours;
        break;
      case TimeActionEnum.decreaseHours:
        currentTime.hours =
          (currentTime.hours - TIME.hourStep + TIME.hours) % TIME.hours;
        break;
      case TimeActionEnum.increaseMinutes:
        currentTime.minutes =
          (currentTime.minutes + TIME.minuteStep) % TIME.minutes;
        if (!currentTime.minutes) {
          currentTime.hours = (currentTime.hours + TIME.hourStep) % TIME.hours;
        }
        break;
      case TimeActionEnum.decreaseMinutes:
        currentTime.minutes =
          (currentTime.minutes - TIME.minuteStep + TIME.minutes) % TIME.minutes;
        if (currentTime.minutes === TIME.minuteLimit) {
          currentTime.hours =
            (currentTime.hours - TIME.hourStep + TIME.hours) % TIME.hours;
        }
        break;
      case TimeActionEnum.done:
        await this.handleDoneAction(ctx, currentTime);
        break;
      default:
        return;
    }

    await this.updateMessage(ctx, currentTime);
  }

  async handleDoneAction(@Ctx() ctx: Context, currentTime: TimeDto) {
    try {
      const previousSceneData = JSON.parse(
        ctx.session.__scenes.state.previousSceneData,
      );

      const tempDate = new Date();
      tempDate.setHours(currentTime.hours - 3);
      tempDate.setMinutes(currentTime.minutes);

      currentTime.hours = tempDate.getHours();
      currentTime.minutes = tempDate.getMinutes();

      previousSceneData.time = currentTime;

      ctx.state.previousSceneData = JSON.stringify(previousSceneData);
      ctx.step = ctx.session.__scenes.step;

      const previousScene = ctx.session.__scenes.state.previousScene;

      await ctx.scene.enter(previousScene);
      await ctx.scene.leave();
    } catch (error) {
      await ctx.sendMessage(error.message);
    }
  }

  async updateMessage(@Ctx() ctx: Context, currentTime: TimeDto) {
    await ctx
      .editMessageText(
        TimePhrases.currentTime(formatTime(currentTime)),
        timeButtons(),
      )
      .catch(() => {});
  }
}
