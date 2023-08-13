import { Markup } from 'telegraf';
import { TaskActionEnum } from '../../services/enums/task-action.enum';

export function taskActionButtons() {
  return Markup.inlineKeyboard([
    Markup.button.callback('Добавить задачу', TaskActionEnum.addTask),
    Markup.button.callback('Удалить задачу', TaskActionEnum.deleteTask),
    Markup.button.callback('Назад в меню', TaskActionEnum.menu),
  ]);
}
