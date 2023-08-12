import {
  Action,
  Ctx,
  InjectBot,
  Message,
  On,
  Scene,
  SceneEnter,
} from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { Context } from '../interfaces/context.interface';
import { SceneEnum } from './enums/scene.enum';

import { TaskPhrases } from './enums/phrases/task.phrases';
import { taskActionButtons } from '../buttons/task/task-action.button';

import { TaskService as Service } from '../../task/task.service';
import { UserService } from 'src/core/user/user.service';
import { formatTasks } from './utils/task-methods';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { actionButtons } from '../buttons/actions.button';

@Scene(SceneEnum.taskScene)
export class TaskService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly taskService: Service,
    private readonly userService: UserService,
  ) {}

  @SceneEnter()
  async startTaskScene(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    if (ctx.state?.city) {
      ctx.session.__scenes.type = 'taskTime';
      await this.handleUserMessage(ctx, message);
    } else {
      const telegrammID = message?.from.id || ctx.chat.id;
      const tasks = await this.getUsersTasks(telegrammID);

      await ctx.sendMessage(TaskPhrases.start(tasks), taskActionButtons());
    }
  }

  @Action('/addTask')
  async addTaskAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.sendMessage(TaskPhrases.enterTaskTitle, Markup.removeKeyboard());

    ctx.session.__scenes.state.task = {};
    ctx.session.__scenes.type = 'taskTitle';
  }

  @Action('/menu')
  async menu(@Ctx() ctx: Context) {
    ctx.sendMessage('Главное меню', actionButtons());
    ctx.scene.leave();
  }

  @On('text')
  async handleUserMessage(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    switch (ctx.session.__scenes.type) {
      case 'taskTitle': {
        ctx.session.__scenes.state.task.title = message.text;
        ctx.session.__scenes.type = 'taskDescription';

        ctx.sendMessage(TaskPhrases.enterTaskDescription);
        break;
      }
      case 'taskDescription': {
        ctx.session.__scenes.state.task.description = message.text;
        ctx.session.__scenes.type = 'taskTime';

        ctx.sendMessage(TaskPhrases.enterTaskDate);

        ctx.state.preventScene = SceneEnum.taskScene;
        ctx.state.preventSceneData = JSON.stringify(
          ctx.session.__scenes.state.task,
        );
        ctx.scene.enter(SceneEnum.dateScene);

        break;
      }
      case 'taskTime': {
        const [day, month, year] = ctx.state.city
          .split('-')
          .map((el) => Number(el));

        const date = new Date();
        date.setFullYear(year, month - 1, day);

        console.log(date.toLocaleDateString());

        const taskInfo = JSON.parse(ctx.state.preventSceneData);

        const task = await this.taskService.create({ ...taskInfo, time: date });

        const telegrammID = ctx.chat.id;
        const user = await this.userService.findBy({ telegrammID });
        await user.$add('task', task);

        ctx.state = null;
        ctx.scene.reenter();
        break;
      }

      default:
        break;
    }
  }

  async getUsersTasks(telegrammID: number): Promise<string[]> {
    const user = await this.userService.findBy({ telegrammID });

    let tasks: string[] = [];

    if (user) {
      tasks = formatTasks(await user.$get('tasks'));
    }

    return tasks;
  }
}
