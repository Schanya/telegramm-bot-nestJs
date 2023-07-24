import { Hears, InjectBot, Message, On, Update } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { Telegraf } from 'telegraf';
import axios from 'axios';

@Update()
export class WeatherService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  async getWeather(ctx: Context) {
    await ctx.reply('Введите город');
  }

  @On('text')
  async getCity(ctx: Context, @Message() message: string) {
    const city = message['text'];

    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=ru&appid=3c3b996343a336616ba97438391b47b4`,
    );

    await this.bot.telegram.sendMessage(
      message['chat'].id,
      `Погода: ${data['weather'][0].description}\nТемпература: ${Math.floor(
        +data['main'].temp - 273.15,
      )}°C`,
    );
  }
}
