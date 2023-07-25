import { Markup } from 'telegraf';

export function weatherButtons() {
  return Markup.inlineKeyboard([
    Markup.button.callback('Указать город', '/city'),
    Markup.button.callback('Оформить пописку', '/subscription'),
  ]);
}
