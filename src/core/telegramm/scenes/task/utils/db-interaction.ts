import { Task } from 'src/core/task/task.model';
import { TaskService } from 'src/core/task/task.service';
import { Context } from 'src/core/telegramm/interfaces/context.interface';
import { UserService } from 'src/core/user/user.service';

export async function saveTask(
  ctx: Context,
  taskService: TaskService,
  userService: UserService,
): Promise<Task> {
  const { date: time, ...taskInfo } = JSON.parse(ctx.state.previousSceneData);

  const createdTask = await taskService.create({
    ...taskInfo,
    time,
    notification: false,
  });

  const telegrammID = ctx.chat.id;
  let user = await userService.findBy({ telegrammID });

  if (!user) {
    user = await userService.create({
      name: ctx.callbackQuery.from.first_name,
      telegrammID,
    });
  }

  await user.$add('task', createdTask);

  return createdTask;
}

export async function getUsersTasks(
  telegrammID: number,
  userService: UserService,
): Promise<Task[]> {
  const user = await userService.findBy({ telegrammID });

  let tasks: Task[] = [];

  if (user) {
    tasks = await user.$get('tasks');
  }

  return tasks;
}
