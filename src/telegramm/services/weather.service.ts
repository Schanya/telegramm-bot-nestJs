import {
  Action,
  Ctx,
  InjectBot,
  Message,
  On,
  Scene,
  Update,
} from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { Telegraf } from 'telegraf';
import axios from 'axios';
import { weatherButtons } from '../buttons/weather.button';
import { CityService } from 'src/core/city/city.service';
import { UserService } from 'src/core/user/user.service';

@Update()
export class WeatherService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly cityService: CityService,
    private readonly userSrvice: UserService,
  ) {}

  async getWeather(@Ctx() ctx: Context) {
    await ctx.reply('Выберите действие', weatherButtons());
  }

  @Action('/city')
  async cityAction(@Ctx() ctx: Context) {
    ctx.editMessageText('Введите название города');
    ctx.session.type = 'city';
  }

  @Action('/subscription')
  async subscriptionAction(@Ctx() ctx: Context) {
    ctx.editMessageText(
      'Введите название города, обновления погоды которого хотите знать',
    );
    ctx.session.type = 'subscription';
  }

  @On('text')
  async getCity(@Ctx() ctx: Context, @Message() message: string) {
    const city = message['text'];
    switch (ctx.session.type) {
      case 'city': {
        const { data } = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=ru&appid=3c3b996343a336616ba97438391b47b4`,
        );

        await this.bot.telegram.sendMessage(
          message['chat'].id,
          `Погода: ${data['weather'][0].description}\nТемпература: ${Math.floor(
            +data['main'].temp - 273.15,
          )}°C`,
        );

        break;
      }
      case 'subscription': {
        let existingCity = await this.cityService.findBy({ name: city });
        if (!existingCity) {
          existingCity = await this.cityService.create({ name: city });
        }

        let existingUser = await this.userSrvice.findBy({
          telegrammID: ctx.message.from.id,
        });
        if (!existingUser) {
          existingUser = await this.userSrvice.create({
            name: ctx.message.from.first_name,
            telegrammID: ctx.message.from.id,
          });
        }
        await existingCity.$add('user', existingUser);

        await this.bot.telegram.sendMessage(
          ctx.message.chat.id,
          'Данные сохранены, теперь вы будуте получать рассылку',
        );
      }
    }
  }
}
