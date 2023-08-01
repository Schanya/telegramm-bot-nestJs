import { BadRequestException } from '@nestjs/common';
import {
  Action,
  Ctx,
  InjectBot,
  Message,
  On,
  Scene,
  SceneEnter,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { weatherButtons } from '../buttons/weather.button';
import { Context } from '../interfaces/context.interface';
import { WeatherDto, WeatherParamsDto } from './dto/weather.dto';
import { SceneEnum } from './enums/scene.enum';
import { axiosDownload } from './help/httpRequest';

@Scene(SceneEnum.weatherScene)
export class WeatherService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @SceneEnter()
  async startWeatherScene(@Ctx() ctx: Context) {
    await ctx.reply('Выберите действие', weatherButtons());
  }

  @Action('/city')
  async cityAction(@Ctx() ctx: Context) {
    ctx.editMessageText(
      'Введите название города, погоду которого хотите знать',
    );
    ctx.session.__scenes.type = 'weather';
  }

  @Action('/subscription')
  async subscriptionAction(@Ctx() ctx: Context) {
    await ctx.editMessageText(
      'Введите название города, погоду которого хотите знать',
    );

    ctx.session.__scenes.type = 'subscription';
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
      const params: WeatherParamsDto = {
        q: city,
        lang: 'ru',
        appid: process.env.WEATHER_KEY,
        units: 'metric',
      };
      const { data } = await axiosDownload(process.env.WEATHER_URL, params);

      const cityName = data.name;
      const weatherDescription = data['weather'][0].description;
      const temperature = Number(data['main'].temp);

      const result: WeatherDto = {
        cityName,
        description: weatherDescription,
        temperature,
      };

      return result;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @On('text')
  async getCity(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    try {
      const messageText = message.text;
      let { cityName, description, temperature } = await this.getWeather(
        messageText,
      );

      switch (ctx.session.__scenes.type) {
        case 'weather': {
          await ctx.sendMessage(
            `Погода: ${description}\nТемпература: ${temperature}°C`,
          );

          await ctx.scene.leave();

          break;
        }
        case 'subscription': {
          ctx.state.city = cityName;
          ctx.state.evenType = 'weather';
          ctx.scene.enter(SceneEnum.timeScene, ctx.state);

          break;
        }
      }
    } catch (e) {
      ctx.sendMessage('В названии города что-то не так, повторите ввод');
    }
  }
}
