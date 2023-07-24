import { InjectBot } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { Telegraf } from 'telegraf';
import axios from 'axios';

export class DogService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  async getDogImage(ctx: Context) {
    const { data } = await axios.get(process.env.DOG_URL);

    await this.bot.telegram.sendPhoto(ctx.message.chat.id, data.url);
  }
}
