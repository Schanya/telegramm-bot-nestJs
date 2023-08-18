import { dog } from 'env';

import { InjectBot, Scene, SceneEnter } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import { SceneEnum } from '@telegramm/enums';
import { Context } from '@telegramm/interfaces';
import { axiosDownload } from '../utils';

@Scene(SceneEnum.dogScene)
export class DogScene {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @SceneEnter()
  async getDogImage(ctx: Context) {
    try {
      const { data } = await axiosDownload(dog.url);

      await this.bot.telegram.sendPhoto(ctx.message.chat.id, data.url);
    } catch (error) {
      await ctx.sendMessage('Упс, что-то не так, повторите запрос');
    }
  }
}
