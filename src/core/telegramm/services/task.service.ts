import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { Context } from '../interfaces/context.interface';
import { SceneEnum } from './enums/scene.enum';

import { TaskPhrases } from './enums/phrases/task.phrases';
import { taskActionButtons } from '../buttons/task/task-action.button';

import { TaskService as Service } from '../../task/task.service';
import { UserService } from 'src/core/user/user.service';
import { formatTasks } from './utils/task-methods';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { actionButtons } from '../buttons/actions.button';
import { ReadAllTaskDto } from 'src/core/task/dto/read-all-tasks.dto';
import { CreateTaskParams } from './dto/task.dto';
import { TaskContextStepEnum } from './enums/task-context-step.enum';

@Scene(SceneEnum.taskScene)
export class TaskService {
  constructor(
    private readonly taskService: Service,
    private readonly userService: UserService,
  ) {}

  private stepHandlers = {
    title: this.handleTitleInput,
    description: this.handleDescriptionInput,
    save: this.saveTaskAndExit,
  };

  @SceneEnter()
  async startTaskScene(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    if (ctx.state?.previousSceneData) {
      return await this.saveTaskAndExit(ctx);
    }

    const telegrammID = message?.from.id || ctx.chat.id;
    const tasks = await this.getUsersTasks(telegrammID);

    await ctx.sendMessage(TaskPhrases.start(tasks), taskActionButtons());
  }

  @Action('/addTask')
  async addTaskAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.sendMessage(TaskPhrases.enterTaskTitle, Markup.removeKeyboard());

    ctx.session.__scenes.state.task = {};
    ctx.session.__scenes.step = TaskContextStepEnum.title;
  }

  @Action('/menu')
  async menu(@Ctx() ctx: Context) {
    await ctx.sendMessage('Главное меню', actionButtons());
    ctx.scene.leave();
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
    task: ReadAllTaskDto,
  ) {
    task.title = message.text;
    ctx.session.__scenes.step = TaskContextStepEnum.description;

    await ctx.sendMessage(TaskPhrases.enterTaskDescription);
  }

  private async handleDescriptionInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
    task: ReadAllTaskDto,
  ) {
    task.description = message.text;
    ctx.session.__scenes.step = TaskContextStepEnum.date;

    await ctx.sendMessage(TaskPhrases.enterTaskDate);

    ctx.state.previousScene = SceneEnum.taskScene;
    ctx.state.previousSceneData = JSON.stringify(task);

    ctx.scene.enter(SceneEnum.dateScene);
  }

  private async saveTaskAndExit(@Ctx() ctx: Context) {
    const { date: time, ...taskInfo } = JSON.parse(ctx.state.previousSceneData);

    const task = await this.taskService.create({ ...taskInfo, time });

    const telegrammID = ctx.chat.id;
    const user = await this.userService.findBy({ telegrammID });
    await user.$add('task', task);

    delete ctx.state.previousSceneData;
    ctx.scene.reenter();
  }

  private async getUsersTasks(telegrammID: number): Promise<string[]> {
    const user = await this.userService.findBy({ telegrammID });

    let tasks: string[] = [];

    if (user) {
      tasks = formatTasks(await user.$get('tasks'));
    }

    return tasks;
  }
}
