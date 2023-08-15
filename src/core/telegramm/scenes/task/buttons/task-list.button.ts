import { Task } from 'src/core/task/task.model';
import { Markup } from 'telegraf';

export function tasksListButtons(tasks: Task[]) {
  const buttons = [];

  tasks.forEach((task) =>
    buttons.push(Markup.button.callback(task.title, task.id.toString())),
  );

  return Markup.inlineKeyboard(buttons, {
    columns: Math.floor(buttons.length / 3),
  });
}
