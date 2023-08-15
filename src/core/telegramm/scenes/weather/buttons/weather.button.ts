import { Markup } from 'telegraf';
import { WeatherActionEnum } from '../enums';

export function weatherButtons() {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('Узнать погоду', WeatherActionEnum.getWeather),
      Markup.button.callback(
        'Оформить пописку',
        WeatherActionEnum.subscription,
      ),
      Markup.button.callback('Главное меню', WeatherActionEnum.menu),
      Markup.button.callback(
        'Отменить подписку',
        WeatherActionEnum.unsubscribe,
      ),
    ],
    { columns: 2 },
  );
}
