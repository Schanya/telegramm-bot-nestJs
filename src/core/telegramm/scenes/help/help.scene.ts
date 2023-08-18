import { InjectBot, Scene, SceneEnter } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import { SceneEnum } from '@telegramm/enums';
import { Context } from '@telegramm/interfaces';
import { helpList } from '../utils';

@Scene(SceneEnum.helpScene)
export class HelpScene {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @SceneEnter()
  async getHelpList(ctx: Context) {
    await ctx.reply(helpList());
  }
}
