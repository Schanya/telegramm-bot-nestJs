import { Task } from 'src/core/task/task.model';

export const TaskPhrases = {
  start: (tasks: string[]) => {
    if (!tasks.length) return `Ваш список пуст, добавьте задачи`;

    const tasksStr = tasks.reduce(
      (s, task, i) => (s += `${i + 1}. ${task}\n`),
      '',
    );

    return `Ваш список задач:\n ${tasksStr}`;
  },
  enterTaskTitle: `Введите название задачи`,
  enterTaskDescription: 'Введите описание задачи',
  enterTaskDate: 'Выберите дату выполнения задачи',
  whichTaskRemove: 'Какую задачу вы хотите удалить?',
  addNotificationQuestion: 'Добавить уведомление на эту задачу?',
  enterNotificationTime: 'Укажите время для напоминания',
  notificationText: (task: Task) =>
    `Внимание, сегодня необходимо закончить следующую задачу!\n ${task.title}\n\t${task.description}`,
  menu: 'Главное меню',
};
