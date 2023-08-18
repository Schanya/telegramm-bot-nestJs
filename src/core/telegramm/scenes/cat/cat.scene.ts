import { cat } from 'env';

import { InjectBot, Scene, SceneEnter } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import { SceneEnum } from '@telegramm/enums';
import { Context } from '@telegramm/interfaces';
import { axiosDownload } from '../utils';

@Scene(SceneEnum.catScene)
export class CatScene {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @SceneEnter()
  async getCatImage(ctx: Context) {
    try {
      const { data } = await axiosDownload(cat.url);

      await this.bot.telegram.sendPhoto(ctx.message.chat.id, data[0].url);
    } catch (error) {
      await ctx.sendMessage('Упс, что-то не так, повторите запрос');
    }
  }
}
