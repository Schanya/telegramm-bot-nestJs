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
  enterTaskDate: 'Ввыберите дату выполнения задачи в формате день:месяц:год',
  wrongTaskDateFormat: 'Дата введена не правильно, повторите ввод',
};
