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
};
