import { HttpStatusCode } from 'axios';
import { Context } from 'src/core/telegramm/interfaces/context.interface';
import { SightPhrases } from '../enums';
import { NotFoundException } from '@nestjs/common';

export async function handleErrorResponse(ctx: Context, error: any) {
  if (error.response?.status === HttpStatusCode.TooManyRequests) {
    await ctx.sendMessage(SightPhrases.tooManyRequests);
    return;
  }

  if (error instanceof NotFoundException) {
    if (error.name == 'ActionNotFoundExeption') {
      await ctx.sendMessage(error.message);
    } else {
      await ctx.sendMessage(error.message);
      await ctx.scene.reenter();
    }

    return;
  }

  await ctx.sendMessage(SightPhrases.sendError);
}
