import { Markup } from 'telegraf';

export function timeButtons() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔺', 'increaseHours'),
      Markup.button.callback('🔺', 'increaseMinutes'),
    ],
    [
      Markup.button.callback('🔽', 'decreaseHours'),
      Markup.button.callback('🔽', 'decreaseMinutes'),
    ],
    [Markup.button.callback('✅ Готово', 'done')],
  ]);
}
