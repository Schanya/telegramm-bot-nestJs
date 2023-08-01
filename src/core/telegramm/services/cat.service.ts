import { InjectBot, Scene, SceneEnter } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from '../interfaces/context.interface';
import { SceneEnum } from './enums/scene.enum';
import { axiosDownload } from './help/httpRequest';

@Scene(SceneEnum.catScene)
export class CatService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @SceneEnter()
  async getCatImage(ctx: Context) {
    const { data } = await axiosDownload(process.env.CAT_URL);

    await this.bot.telegram.sendPhoto(ctx.message.chat.id, data[0].url);
  }
}
