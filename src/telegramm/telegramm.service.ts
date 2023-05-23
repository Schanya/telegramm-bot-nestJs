import { Command, Hears, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import axios from 'axios';

import { actionButtons } from './buttons/actions.button';
import { Context } from './interfaces/context.interface';
import { helpList } from './utils/show-help-list.utils';

@Update()
export class TelegrammService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(`Привет 👋, ${ctx.message.from.first_name}\n`);
    await ctx.reply('Что ты хочешь сделать?', actionButtons());
  }

  @Hears('🆘 Help')
  async helpHears(ctx: Context) {
    await this.helpCommand(ctx);
  }

  @Hears('🌤 Weather')
  async weatherHears(ctx: Context) {
    await ctx.reply('Ещё не реализовано(');
  }

  @Hears('🐱 Cat')
  async catHears(ctx: Context) {
    await this.catCommand(ctx);
  }

  @Hears('🐶 Dog')
  async dogHears(ctx: Context) {
    await this.dogCommand(ctx);
  }

  @Command('help')
  async helpCommand(ctx: Context) {
    await ctx.reply(helpList());
  }

  @Command('dog')
  async dogCommand(ctx: Context) {
    const { data } = await axios.get(process.env.DOG_URL);

    await this.bot.telegram.sendPhoto(ctx.message.chat.id, data.url);
  }

  @Command('cat')
  async catCommand(ctx: Context) {
    const { data } = await axios.get(process.env.CAT_URL);

    await this.bot.telegram.sendPhoto(ctx.message.chat.id, data[0].url);
  }
}
