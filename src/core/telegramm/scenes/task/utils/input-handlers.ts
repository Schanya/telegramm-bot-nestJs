import { Message as MessageType } from 'telegraf/typings/core/types/typegram';

import { SceneEnum } from '@telegramm/enums';
import { Context } from '@telegramm/interfaces';

import { CreateTaskParams } from '../dto';
import { TaskContextStepEnum, TaskPhrases } from '../enums';

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
