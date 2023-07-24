import { Command, Hears, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import { actionButtons } from '../buttons/actions.button';
import { Context } from '../interfaces/context.interface';
import { CatService } from '../services/cat.service';
import { DogService } from '../services/dog.service';
import { HelpService } from '../services/help.service';
import { WeatherService } from '../services/weather.service';

@Update()
export class TelegrammService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly catService: CatService,
    private readonly dogService: DogService,
    private readonly helpService: HelpService,
    private readonly weatherService: WeatherService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(`Привет 👋, ${ctx.message.from.first_name}\n`);
    await ctx.reply('Что ты хочешь сделать?', actionButtons());
  }

  @Hears('🆘 Help')
  @Command('help')
  async helpHears(ctx: Context) {
    await this.helpService.getHelpList(ctx);
  }

  @Hears('🐱 Cat')
  @Command('cat')
  async catHears(ctx: Context) {
    await this.catService.getCatImage(ctx);
  }

  @Hears('🐶 Dog')
  @Command('dog')
  async dogHears(ctx: Context) {
    await this.dogService.getDogImage(ctx);
  }

  @Hears('🌤 Weather')
  @Command('weather')
  async weatherHears(ctx: Context) {
    await this.weatherService.getWeather(ctx);
  }
}
