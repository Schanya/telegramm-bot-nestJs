import { InjectBot, Scene, SceneEnter } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from '../../interfaces/context.interface';
import { SceneEnum } from '../../enums/scene.enum';
import { axiosDownload } from '../utils/httpRequest';
import { dog } from 'env';

@Scene(SceneEnum.dogScene)
export class DogScene {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @SceneEnter()
  async getDogImage(ctx: Context) {
    const { data } = await axiosDownload(dog.url);

    await this.bot.telegram.sendPhoto(ctx.message.chat.id, data.url);
  }
}
