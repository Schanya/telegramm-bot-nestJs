import { Markup } from 'telegraf';
import { TaskActionEnum } from '../enums/task-action.enum';

export function taskActionButtons() {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('Добавить задачу', TaskActionEnum.addTask),
      Markup.button.callback('Удалить задачу', TaskActionEnum.deleteTask),
      Markup.button.callback('Меню', TaskActionEnum.menu),
    ],
    { columns: 2 },
  );
}
