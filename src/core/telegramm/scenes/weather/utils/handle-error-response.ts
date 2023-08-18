import { NotFoundException } from '@nestjs/common';

import { HttpStatusCode } from 'axios';

import { Context } from '@telegramm/interfaces';
import { WeatherPhrases } from '../enums';

export async function errorHandlerResponse(ctx: Context, error: any) {
  if (
    error?.response?.status == HttpStatusCode.NotFound ||
    error instanceof NotFoundException
  ) {
    await ctx.sendMessage(error.message);
  } else if (
    error.name == 'SubscriptionExeption' ||
    error.name == 'UnsubscribeExeption'
  ) {
    await ctx.sendMessage(error.message);
    await ctx.scene.reenter();
  } else {
    await ctx.sendMessage(WeatherPhrases.sendError);
  }

  return;
}
