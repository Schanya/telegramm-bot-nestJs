import { Task } from '@task/task.model';
import { railwayServiceTimeZoneOffset } from '@telegramm/enums';
import {
  dateToTimeDto,
  formatDateToString,
  formatTime,
} from '@telegramm/scenes/utils';

export function formatTasks(tasks: Task[]): string[] {
  const currentDate = new Date();

  return tasks.map((task) => {
    const difference = task.time.getTime() - currentDate.getTime();
    task.time.setHours(task.time.getHours() + railwayServiceTimeZoneOffset);

    const hasNotification = ` ${task.notification ? '🔔' : ''}`;
    const notificationTime = task.notification
      ? `\n \tВремя уведомления: ${formatTime(dateToTimeDto(task.time))} ${
          difference >= 0 ? '\n' : '🔚\n'
        }`
      : '\n';

    return (
      `${task.title + hasNotification}\n \t${
        task.description
      }\n \tДата выполнения: ${formatDateToString(task.time)}` +
      notificationTime
    );
  });
}
