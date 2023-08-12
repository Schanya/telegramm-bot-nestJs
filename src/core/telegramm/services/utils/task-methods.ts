import { Task } from 'src/core/task/task.model';

export function formatTasks(tasks: Task[]): string[] {
  return tasks.map((task) => {
    return `${task.title}\n\t${task.description}\n\t${task.time}\n`;
  });
}
