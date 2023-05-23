import { Markup } from 'telegraf';

export function actionButtons() {
  return Markup.keyboard(
    [
      Markup.button.callback('🆘 Help', '/help'),
      Markup.button.callback('🌤 Weather', '/weather'),
      Markup.button.callback('🐱 Cat', '/cat'),
      Markup.button.callback('🐶 Dog', '/dog'),
    ],
    {
      columns: 2,
    },
  );
}
