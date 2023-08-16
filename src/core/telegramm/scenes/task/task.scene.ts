import { telegramm } from 'env';

import { OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { callbackQuery } from 'telegraf/filters';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';

import { Context } from '../../interfaces/context.interface';

import { UserService } from 'src/core/user/user.service';
import { TaskService } from '../../../task/task.service';

import { NotificationScene } from '../notification/notification.scene';

import { actionButtons } from '../../buttons/actions.button';
import {
  taskActionButtons,
  taskNotificationButtons,
  tasksListButtons,
} from './buttons';

import { CreateTaskParams } from './dto';

import {
  formatTasks,
  getUsersTasks,
  handleDescriptionInput,
  handleTitleInput,
  saveTask,
} from './utils';

import { SceneEnum } from '../../enums/scene.enum';
import { compareDateWithCurrent } from '../utils';
import { TaskActionEnum, TaskContextStepEnum, TaskPhrases } from './enums';

@Scene(SceneEnum.taskScene)
export class TaskScene implements OnModuleInit {
  constructor(
    private readonly taskService: TaskService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationScene,
  ) {}

  private stepHandlers = {
    title: handleTitleInput,
    description: handleDescriptionInput,
    save: this.saveTaskAndExit,
    addNotification: this.handleNotificationInput,
  };

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async onModuleInit() {
    const users = await this.userService.findAll({});

    for (const user of users) {
      const tasks = await user.$get('tasks', { where: { notification: true } });
      for (const task of tasks) {
        if (compareDateWithCurrent(task.time)) {
          const cronName = `${task.id} task notification for ${user.telegrammID}`;

          const map = new Map();
          map.set(user.telegrammID, TaskPhrases.notificationText(task));

          await this.notificationService.addCronJob(
            cronName,
            task.time,
            this.handleCron,
            map,
            false,
          );
        }
      }
    }

    this.notificationService.getCrons();
  }

  async handleCron(usersTask: Map<number, string>) {
    const bot = new Telegraf(telegramm.token);
    for (const [id, taskInfo] of usersTask) {
      await bot.telegram.sendMessage(id, taskInfo);
    }
  }

  @SceneEnter()
  async startTaskScene(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    if (ctx.state?.previousSceneData) {
      ctx.session.__scenes.state.sessionData = {};
      ctx.session.__scenes.state.sessionData.task = {};
      ctx.session.__scenes.step = ctx.step;

      return await this.handleInput(ctx, message);
    }

    const telegrammID = message?.from.id || ctx.chat.id;
    const tasks = formatTasks(
      await getUsersTasks(telegrammID, this.userService),
    );

    await ctx.sendMessage(TaskPhrases.start(tasks), taskActionButtons());
  }

  @Action(TaskActionEnum.addTask)
  async addTaskAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.sendMessage(TaskPhrases.enterTaskTitle, Markup.removeKeyboard());

    ctx.session.__scenes.state.sessionData = {};
    ctx.session.__scenes.state.sessionData.task = {};
    ctx.session.__scenes.step = TaskContextStepEnum.title;
  }

  @Action(TaskActionEnum.deleteTask)
  async deleteTaskAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();

    const telegrammID = ctx.chat.id;
    const tasks = await getUsersTasks(telegrammID, this.userService);

    await ctx.sendMessage(TaskPhrases.whichTaskRemove, tasksListButtons(tasks));
  }

  @Action(TaskActionEnum.menu)
  async menu(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();

    await ctx.sendMessage(TaskPhrases.menu, actionButtons());
    await ctx.scene.leave();
  }

  @Action(/\d+/)
  async deleteTask(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    if (ctx.has(callbackQuery('data'))) {
      const taskId = Number(ctx.callbackQuery.data);
      const telegrammID = ctx.chat.id;

      await this.taskService.delete(taskId);

      const cronName = `${taskId} task notification for ${telegrammID}`;
      this.notificationService.deleteCron(cronName);
      this.notificationService.getCrons();

      await ctx.scene.reenter();
    }
  }

  @Action(TaskActionEnum.addNotification)
  async addNotification(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();

    ctx.state.previousScene = SceneEnum.taskScene;
    ctx.state.previousSceneData = JSON.stringify(
      ctx.session.__scenes.state.sessionData.task,
    );
    ctx.step = TaskContextStepEnum.addNotification;

    await ctx.scene.leave();
    await ctx.scene.enter(SceneEnum.timeScene);
  }

  @Action(TaskActionEnum.noNotification)
  async noNatification(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();

    await ctx.scene.reenter();
  }

  @On('text')
  async handleInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    const step = ctx.session.__scenes.step;
    const task: CreateTaskParams = ctx.session.__scenes.state.sessionData.task;

    const handler = this.stepHandlers[step];
    if (handler) {
      await handler.call(this, ctx, message, task);
    }
  }

  private async handleNotificationInput(@Ctx() ctx: Context) {
    const { time, id } = JSON.parse(ctx.state.previousSceneData);
    const task = await this.taskService.findOne({ id });

    const date = task.time;
    date.setHours(time.hours, time.minutes);

    await this.taskService.update({ id, notification: true, time: date });

    if (compareDateWithCurrent(date)) {
      const cronName = `${task.id} task notification for ${ctx.chat.id}`;
      const userTask = new Map().set(
        ctx.chat.id,
        TaskPhrases.notificationText(task),
      );
      await this.notificationService.addCronJob(
        cronName,
        date,
        this.handleCron,
        userTask,
        false,
      );
    }

    this.notificationService.getCrons();

    delete ctx.step;
    delete ctx.state.previousSceneData;

    const tasks = formatTasks(
      await getUsersTasks(ctx.chat.id, this.userService),
    );

    await ctx.sendMessage(TaskPhrases.start(tasks), actionButtons());
  }

  private async saveTaskAndExit(@Ctx() ctx: Context) {
    const createdTask = await saveTask(ctx, this.taskService, this.userService);

    ctx.session.__scenes.state.sessionData.task.id = createdTask.id;

    await ctx.sendMessage(
      TaskPhrases.addNotificationQuestion,
      taskNotificationButtons(),
    );
  }
}
