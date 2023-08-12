import { Markup } from 'telegraf';

export function taskActionButtons() {
  return Markup.inlineKeyboard([
    Markup.button.callback('Добавить задачу', '/addTask'),
    Markup.button.callback('Удалить задачу', '/deleteTask'),
    Markup.button.callback('Назад в меню', '/menu'),
  ]);
}
