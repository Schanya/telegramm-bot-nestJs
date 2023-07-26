import { InjectBot } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { Telegraf } from 'telegraf';
import axios from 'axios';

export class CatService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  async getCatImage(ctx: Context) {
    const { data } = await axios.get(process.env.CAT_URL);

    await this.bot.telegram.sendPhoto(ctx.message.chat.id, data[0].url);
  }
}
