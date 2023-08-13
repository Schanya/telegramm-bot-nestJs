import { Markup } from 'telegraf';

export function sightButtons() {
  return Markup.keyboard(
    [
      Markup.button.locationRequest('Поблизости'),
      Markup.button.callback('В указанном городе', '/sightCity'),
    ],
    { columns: 2 },
  );
}
