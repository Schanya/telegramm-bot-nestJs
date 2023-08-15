import { Markup } from 'telegraf';
import { TaskActionEnum } from '../enums/task-action.enum';

export function taskNotificationButtons() {
  return Markup.inlineKeyboard([
    Markup.button.callback('Да', TaskActionEnum.addNotification),
    Markup.button.callback('Нет', TaskActionEnum.noNotification),
  ]);
}
