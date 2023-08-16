import { Markup } from 'telegraf';
import { SightActionEnum } from '../enums/sight-action.enum';

export function continueSightButtons() {
  return Markup.inlineKeyboard([
    Markup.button.callback('Далее', SightActionEnum.continue),
    Markup.button.callback('Меню', SightActionEnum.menu),
  ]);
}
