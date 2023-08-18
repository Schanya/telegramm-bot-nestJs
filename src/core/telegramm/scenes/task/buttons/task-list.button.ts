import { Markup } from 'telegraf';

import { Task } from '@task/task.model';

export function tasksListButtons(tasks: Task[]) {
  const buttons = [];

  tasks.forEach((task) =>
    buttons.push(Markup.button.callback(task.title, task.id.toString())),
  );

  return Markup.inlineKeyboard(buttons, {
    columns: 5,
  });
}
