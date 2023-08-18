import { Markup } from 'telegraf';

import { Task } from '@task/task.model';
import { railwayServiceTimeZoneOffset } from '@telegramm/enums';

export function tasksListButtons(tasks: Task[]) {
  const buttons = [];
  const currentDate = new Date();

  tasks.forEach((task) => {
    const difference = task.time.getTime() - currentDate.getTime();
    const notificationTime = `${difference >= 0 ? '' : ' 🔚'}`;

    buttons.push(
      Markup.button.callback(task.title + notificationTime, task.id.toString()),
    );
  });

  return Markup.inlineKeyboard(buttons, {
    columns: 1,
  });
}
