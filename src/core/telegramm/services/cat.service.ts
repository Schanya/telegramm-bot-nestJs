import axios from 'axios';
import { InjectBot, Scene, SceneEnter } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from '../interfaces/context.interface';
import { SceneEnum } from './enums/scene.enum';

@Scene(SceneEnum.catScene)
export class CatService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @SceneEnter()
  async getCatImage(ctx: Context) {
    const { data } = await axios.get(process.env.CAT_URL);

    await this.bot.telegram.sendPhoto(ctx.message.chat.id, data[0].url);
  }
}
