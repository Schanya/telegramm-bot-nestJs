import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { SceneEnum } from '../../enums/scene.enum';
import { Context } from '../../interfaces/context.interface';

import { taskActionButtons } from './buttons/task-action.button';
import { TaskPhrases } from './enums/task.phrases';

import { OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { telegramm } from 'env';
import { Task } from 'src/core/task/task.model';
import { UserService } from 'src/core/user/user.service';
import { callbackQuery } from 'telegraf/filters';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { TaskService } from '../../../task/task.service';
import { actionButtons } from '../../buttons/actions.button';
import { NotificationScene } from '../notification/notification.scene';
import { formatTasks } from '../utils/task-methods';
import { tasksListButtons } from './buttons/task-list.button';
import { taskNotificationButtons } from './buttons/task-notification-question.button';
import { CreateTaskParams } from './dto/task.dto';
import { TaskActionEnum } from './enums/task-action.enum';
import { TaskContextStepEnum } from './enums/task-context-step.enum';
import { compareDateWithCurrent, compareTimeWithCurrent } from '../utils';

@Scene(SceneEnum.taskScene)
export class TaskScene implements OnModuleInit {
  constructor(
    private readonly taskService: TaskService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationScene,
  ) {}

  private stepHandlers = {
    title: this.handleTitleInput,
    description: this.handleDescriptionInput,
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
      ctx.session.__scenes.state.task = {};
      ctx.session.__scenes.step = ctx.step;

      return await this.handleInput(ctx, message);
    }

    const telegrammID = message?.from.id || ctx.chat.id;
    const tasks = formatTasks(await this.getUsersTasks(telegrammID));

    await ctx.sendMessage(TaskPhrases.start(tasks), taskActionButtons());
  }

  @Action(TaskActionEnum.addTask)
  async addTaskAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.sendMessage(TaskPhrases.enterTaskTitle, Markup.removeKeyboard());

    ctx.session.__scenes.state.task = {};
    ctx.session.__scenes.step = TaskContextStepEnum.title;
  }

  @Action(TaskActionEnum.deleteTask)
  async deleteTaskAction(@Ctx() ctx: Context) {
    const telegrammID = ctx.chat.id;
    const tasks = await this.getUsersTasks(telegrammID);

    await ctx.sendMessage(TaskPhrases.whichTaskRemove, tasksListButtons(tasks));
  }

  @Action(TaskActionEnum.menu)
  async menu(@Ctx() ctx: Context) {
    await ctx.sendMessage(TaskPhrases.menu, actionButtons());
    await ctx.scene.leave();
  }

  @Action(/\d+/)
  async deleteTask(@Ctx() ctx: Context) {
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
    ctx.state.previousScene = SceneEnum.taskScene;
    ctx.state.previousSceneData = JSON.stringify(
      ctx.session.__scenes.state.task,
    );
    ctx.step = TaskContextStepEnum.addNotification;

    await ctx.scene.leave();
    await ctx.scene.enter(SceneEnum.timeScene);
  }

  @Action(TaskActionEnum.noNotification)
  async noNatification(@Ctx() ctx: Context) {
    await ctx.scene.reenter();
  }

  @On('text')
  async handleInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    const step = ctx.session.__scenes.step;
    const task: CreateTaskParams = ctx.session.__scenes.state.task;

    const handler = this.stepHandlers[step];
    if (handler) {
      await handler.call(this, ctx, message, task);
    }
  }

  private async handleTitleInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
    task: CreateTaskParams,
  ) {
    task.title = message.text;
    ctx.session.__scenes.step = TaskContextStepEnum.description;

    await ctx.sendMessage(TaskPhrases.enterTaskDescription);
  }

  private async handleDescriptionInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
    task: CreateTaskParams,
  ) {
    task.description = message.text;
    ctx.session.__scenes.step = TaskContextStepEnum.save;

    await ctx.sendMessage(TaskPhrases.enterTaskDate);

    ctx.step = TaskContextStepEnum.save;
    ctx.state.previousScene = SceneEnum.taskScene;
    ctx.state.previousSceneData = JSON.stringify(task);

    await ctx.scene.enter(SceneEnum.dateScene);
  }

  private async saveTaskAndExit(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
    task: CreateTaskParams,
  ) {
    const { date: time, ...taskInfo } = JSON.parse(ctx.state.previousSceneData);

    const createdTask = await this.taskService.create({
      ...taskInfo,
      time,
      notification: false,
    });

    const telegrammID = ctx.chat.id;
    let user = await this.userService.findBy({ telegrammID });

    if (!user) {
      user = await this.userService.create({
        name: ctx.callbackQuery.from.first_name,
        telegrammID,
      });
    }

    await user.$add('task', createdTask);

    ctx.session.__scenes.state.task.id = createdTask.id;

    await ctx.sendMessage(
      TaskPhrases.addNotificationQuestion,
      taskNotificationButtons(),
    );
  }

  private async getUsersTasks(telegrammID: number): Promise<Task[]> {
    const user = await this.userService.findBy({ telegrammID });

    let tasks: Task[] = [];

    if (user) {
      tasks = await user.$get('tasks');
    }

    return tasks;
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

    const tasks = formatTasks(await this.getUsersTasks(ctx.chat.id));

    await ctx.sendMessage(TaskPhrases.start(tasks), actionButtons());
  }
}
