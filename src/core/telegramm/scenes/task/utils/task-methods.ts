import { Task } from 'src/core/task/task.model';
import { compareDateWithCurrent } from '../../utils/date-methods';

export function formatTasks(tasks: Task[]): string[] {
  const currentDate = new Date();
  return tasks.map((task) => {
    return `${task.title} ${
      task.notification ? '(стоит уведомление)' : ''
    }\n\t${task.description}\n\t${task.time.toLocaleString()} ${
      task.time.getTime() - currentDate.getTime() >= 0
        ? ''
        : '(срок выполнения задачи истёк!)'
    }\n`;
  });
}
