import { Markup } from 'telegraf';

export function weatherButtons() {
  return Markup.inlineKeyboard([
    Markup.button.callback('Узнать погоду', '/city'),
    Markup.button.callback('Оформить пописку', '/subscription'),
    Markup.button.callback('Отменить подписку', '/unsubscribe'),
  ]);
}
