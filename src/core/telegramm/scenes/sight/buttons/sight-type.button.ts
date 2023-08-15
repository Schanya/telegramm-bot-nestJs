import { Markup } from 'telegraf';
import { SIGHT_TYPE } from '../enums/sight-type.constants';

export function sightTypeButtons() {
  const buttons = [];
  for (const key in SIGHT_TYPE) {
    if (Object.prototype.hasOwnProperty.call(SIGHT_TYPE, key)) {
      const element = SIGHT_TYPE[key];
      buttons.push(Markup.button.callback(element, key));
    }
  }

  buttons.push(Markup.button.callback('Меню', '/menu'));

  return Markup.inlineKeyboard(buttons, {
    columns: Math.floor(buttons.length / 3),
  });
}
