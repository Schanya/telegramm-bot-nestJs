import { SceneEnum } from 'src/core/telegramm/enums/scene.enum';
import { Context } from 'src/core/telegramm/interfaces/context.interface';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { CreateTaskParams } from '../dto/task.dto';
import { TaskContextStepEnum } from '../enums/task-context-step.enum';
import { TaskPhrases } from '../enums/task.phrases';

export async function handleTitleInput(
  ctx: Context,
  message: MessageType.TextMessage,
  task: CreateTaskParams,
): Promise<void> {
  task.title = message.text;
  ctx.session.__scenes.step = TaskContextStepEnum.description;

  await ctx.sendMessage(TaskPhrases.enterTaskDescription);
}

export async function handleDescriptionInput(
  ctx: Context,
  message: MessageType.TextMessage,
  task: CreateTaskParams,
): Promise<void> {
  task.description = message.text;
  ctx.session.__scenes.step = TaskContextStepEnum.save;

  await ctx.sendMessage(TaskPhrases.enterTaskDate);

  ctx.step = TaskContextStepEnum.save;
  ctx.state.previousScene = SceneEnum.taskScene;
  ctx.state.previousSceneData = JSON.stringify(task);

  await ctx.scene.enter(SceneEnum.dateScene);
}
