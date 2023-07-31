import {
  Action,
  Ctx,
  InjectBot,
  Message,
  On,
  Scene,
  SceneEnter,
} from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { Telegraf } from 'telegraf';
import axios from 'axios';
import { weatherButtons } from '../buttons/weather.button';
import { WeatherDto } from './dto/weather.dto';
import { SceneEnum } from './enums/scene.enum';

@Scene(SceneEnum.weatherScene)
export class WeatherService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @SceneEnter()
  async startWeatherScene(@Ctx() ctx: Context) {
    console.log(ctx.session);
    await ctx.reply('Выберите действие', weatherButtons());
  }

  @Action('/city')
  async cityAction(@Ctx() ctx: Context) {
    ctx.editMessageText(
      'Введите название города, погоду которого хотите знать',
    );
    ctx.session['type'] = 'city';
  }

  @Action('/subscription')
  async subscriptionAction(@Ctx() ctx: Context) {
    await ctx.editMessageText(
      'Введите название города, погоду которого хотите знать',
    );

    ctx.session['type'] = 'weatherCity';
  }

  async sendWeather(
    chatID: number,
    weatherDescription: string,
    temperature: number,
  ) {
    await this.bot.telegram.sendMessage(
      chatID,
      `Погода: ${weatherDescription}\nТемпература: ${temperature}°C`,
    );
  }

  async getWeather(city: string) {
    try {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=ru&appid=3c3b996343a336616ba97438391b47b4`,
      );

      let weatherDescription = data['weather'][0].description;
      let temperature = Math.floor(+data['main'].temp - 273.15);

      let result: WeatherDto = {
        description: weatherDescription,
        temperature,
      };

      return result;
    } catch (error) {
      return error.message;
    }
  }

  @On('text')
  async getCity(@Ctx() ctx: Context, @Message() message: string) {
    const messageText = message['text'];

    switch (ctx.session['type']) {
      case 'city': {
        let { description, temperature } = await this.getWeather(
          messageText,
        ).catch((e) => ctx.sendMessage(`${e.message}`));

        let chatID = message['chat'].id;

        await ctx.sendMessage(
          `Погода: ${description}\nТемпература: ${temperature}°C`,
          chatID,
        );

        await ctx.scene.reenter();

        break;
      }
      case 'weatherCity': {
        ctx.session['data'] = {
          sessionID: ctx.scene.current.id,
          city: messageText,
        };

        ctx.scene.enter(SceneEnum.timeScene);
        break;
      }
    }
  }
}
