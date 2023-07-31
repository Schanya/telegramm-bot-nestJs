import { InjectBot, Scene, SceneEnter } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from '../interfaces/context.interface';
import { helpList } from '../utils/show-help-list.utils';
import { SceneEnum } from './enums/scene.enum';

@Scene(SceneEnum.helpScene)
export class HelpService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @SceneEnter()
  async getHelpList(ctx: Context) {
    await ctx.reply(helpList());
  }
}
