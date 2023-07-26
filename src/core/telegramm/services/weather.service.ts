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
import { CityService } from 'src/core/city/city.service';
import { UserService } from 'src/core/user/user.service';
import { WeatherDto } from './dto/weather.dto';
import { TimeHandler } from '../buttons/time.button';
import { SceneContext } from 'telegraf/typings/scenes';

@Scene('weather')
export class WeatherService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly cityService: CityService,
    private readonly userSrvice: UserService,
    private readonly timeHandler: TimeHandler,
  ) {}

  @SceneEnter()
  async startWeatherScene(@Ctx() ctx: Context) {
    console.log(ctx.session);
    await ctx.reply('Выберите действие', weatherButtons());
  }

  @Action('/city')
  async cityAction(@Ctx() ctx: SceneContext) {
    ctx.editMessageText(
      'Введите название города, погоду которого хотите знать',
    );
    ctx.scene.session.state = { type: 'city' };
  }

  @Action('/subscription')
  async subscriptionAction(@Ctx() ctx: SceneContext) {
    await ctx.editMessageText(
      'Введите название города, погоду которого хотите знать',
    );

    ctx.scene.session.state = {
      type: 'weatherCity',
    };
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
  }

  @On('text')
  async getCity(
    @Ctx() ctx: SceneContext,
    @Ctx() context: Context,
    @Message() message: string,
  ) {
    const messageText = message['text'];
    switch (ctx.scene.session.state['type']) {
      case 'city': {
        let { description, temperature } = await this.getWeather(messageText);
        let chatID = message['chat'].id;

        await this.sendWeather(chatID, description, temperature);

        ctx.scene.reenter();

        break;
      }
      case 'weatherCity': {
        context.session['data'] = {
          sessionID: ctx.scene.current.id,
          city: messageText,
        };
        ctx.scene.enter('timeScene');

        break;
      }
    }
  }
}
