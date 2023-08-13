import { Command, Ctx, Hears, Start, Update } from 'nestjs-telegraf';

import { actionButtons } from '../buttons/actions.button';
import { Context } from '../interfaces/context.interface';
import { SceneEnum } from '../enums/scene.enum';

@Update()
export class TelegrammService {
  constructor() {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(`Привет 👋, ${ctx.message.from.first_name}\n`);
    await ctx.reply('Что ты хочешь сделать?', actionButtons());
  }

  @Hears('🆘 Help')
  @Command('help')
  async helpHears(@Ctx() ctx: Context) {
    ctx.scene.enter(SceneEnum.helpScene);
  }

  @Hears('🐱 Cat')
  @Command('cat')
  async catHears(@Ctx() ctx: Context) {
    ctx.scene.enter(SceneEnum.catScene);
  }

  @Hears('🐶 Dog')
  @Command('dog')
  async dogHears(@Ctx() ctx: Context) {
    ctx.scene.enter(SceneEnum.dogScene);
  }

  @Hears('🌤 Weather')
  @Command('weather')
  async weatherHears(@Ctx() ctx: Context) {
    await ctx.sendMessage('Отлично', {
      reply_markup: { remove_keyboard: true },
    });
    ctx.scene.enter(SceneEnum.weatherScene);
  }

  @Hears('🔍 Sight')
  @Command('sight')
  async sightHears(@Ctx() ctx: Context) {
    await ctx.sendMessage('Отлично', {
      reply_markup: { remove_keyboard: true },
    });
    ctx.scene.enter(SceneEnum.sightScene);
  }

  @Hears('📋 Tasks')
  @Command('task')
  async taskHears(@Ctx() ctx: Context) {
    await ctx.sendMessage('Отлично', {
      reply_markup: { remove_keyboard: true },
    });
    ctx.scene.enter(SceneEnum.taskScene);
  }
}
