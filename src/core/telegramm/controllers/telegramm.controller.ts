import { Command, Ctx, Hears, Start, Update } from 'nestjs-telegraf';

import { actionButtons } from '../buttons';
import { Context } from '../interfaces';
import { SceneEnum, ActionButtonsEnum, ControllerPhrases } from '../enums';

@Update()
export class TelegrammController {
  constructor() {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(ControllerPhrases.greeting(ctx.message.from.first_name));
    await ctx.reply(ControllerPhrases.chooseAction, actionButtons());
  }

  @Hears(ActionButtonsEnum.helpMessage)
  @Command(ActionButtonsEnum.helpCallback)
  async helpHears(@Ctx() ctx: Context) {
    await ctx.scene.enter(SceneEnum.helpScene);
  }

  @Hears(ActionButtonsEnum.catMessage)
  @Command(ActionButtonsEnum.catCallback)
  async catHears(@Ctx() ctx: Context) {
    await ctx.scene.enter(SceneEnum.catScene);
  }

  @Hears(ActionButtonsEnum.dogMessage)
  @Command(ActionButtonsEnum.dogCallback)
  async dogHears(@Ctx() ctx: Context) {
    await ctx.scene.enter(SceneEnum.dogScene);
  }

  @Hears(ActionButtonsEnum.weatherMessage)
  @Command(ActionButtonsEnum.weatherCallback)
  async weatherHears(@Ctx() ctx: Context) {
    await ctx.sendMessage(ControllerPhrases.sceneEnter, {
      reply_markup: { remove_keyboard: true },
    });
    await ctx.scene.enter(SceneEnum.weatherScene);
  }

  @Hears(ActionButtonsEnum.sightMessage)
  @Command(ActionButtonsEnum.sightMessage)
  async sightHears(@Ctx() ctx: Context) {
    await ctx.sendMessage(ControllerPhrases.sceneEnter, {
      reply_markup: { remove_keyboard: true },
    });
    await ctx.scene.enter(SceneEnum.sightScene);
  }

  @Hears(ActionButtonsEnum.taskMessage)
  @Command(ActionButtonsEnum.taskCallback)
  async taskHears(@Ctx() ctx: Context) {
    await ctx.sendMessage(ControllerPhrases.sceneEnter, {
      reply_markup: { remove_keyboard: true },
    });
    await ctx.scene.enter(SceneEnum.taskScene);
  }
}
