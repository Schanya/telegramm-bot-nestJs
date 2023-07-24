import { InjectBot } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { Telegraf } from 'telegraf';
import { helpList } from '../utils/show-help-list.utils';

export class HelpService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  async getHelpList(ctx: Context) {
    await ctx.reply(helpList());
  }
}
