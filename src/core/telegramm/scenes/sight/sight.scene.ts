import { BadRequestException } from '@nestjs/common';

import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { callbackQuery } from 'telegraf/filters';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';

import { SceneEnum } from '@telegramm/enums';
import {
  ActionNotFoundExeption,
  SightsNotFoundExeption,
} from '@telegramm/errors';
import { Context } from '@telegramm/interfaces';

import { formatSightsInfo } from '../utils';
import { SightType } from './types';

import { actionButtons } from '@telegramm/buttons';
import {
  continueSightButtons,
  sightButtons,
  sightTypeButtons,
} from './buttons';

import { SightRequestParams } from './dto';

import {
  SIGHT_TYPE,
  SightActionEnum,
  SightContextStepEnum,
  SightPhrases,
} from './enums';

import {
  getSightInfo,
  getSights,
  handleCityInput,
  handleCityNameInput,
  handleErrorResponse,
} from './utils';

@Scene(SceneEnum.sightScene)
export class SightScene {
  constructor() {}

  private stepHandlers = {
    cityNearby: handleCityInput,
    cityName: handleCityNameInput,
  };

  @SceneEnter()
  async startSightScene(@Ctx() ctx: Context) {
    ctx.session.__scenes.state.sessionData = {};
    ctx.session.__scenes.state.sessionData.sight = {};

    await ctx.sendMessage(SightPhrases.start, sightTypeButtons());
  }

  @Action(Object.keys(SIGHT_TYPE))
  async whereSight(@Ctx() ctx: Context) {
    if (ctx.has(callbackQuery('data'))) {
      await ctx.answerCbQuery();

      ctx.session.__scenes.state.sessionData.sight.type = ctx.callbackQuery
        .data as SightType;

      await ctx.sendMessage(SightPhrases.placeQuestion, sightButtons());
    }
  }

  @Action(SightActionEnum.menu)
  async menuAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.sendMessage(SightPhrases.menu, actionButtons());
    await ctx.scene.leave();
  }

  @On(SightActionEnum.location)
  async getSightNearby(
    @Ctx() ctx: Context,
    @Message() message: MessageType.LocationMessage,
  ) {
    try {
      const kinds = ctx.session.__scenes.state.sessionData.sight.type;

      if (!kinds) {
        throw new BadRequestException(SightPhrases.undefinedSightType);
      }

      const { latitude: lat, longitude: lon } = message.location;
      const sightRequestParams: SightRequestParams = { lat, lon, kinds };

      const sightsXids = await getSights(sightRequestParams);
      ctx.session.__scenes.state.sessionData.sightsXids = sightsXids;

      await this.continueSightsInfo(ctx);
    } catch (error) {
      await handleErrorResponse(ctx, error);
    }
  }

  @On(SightActionEnum.text)
  async handleInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    try {
      if (!ctx.session.__scenes.step && message.text == 'В указанном городе') {
        ctx.session.__scenes.step = SightContextStepEnum.cityNearby;
      }

      const step = ctx.session.__scenes.step;

      if (!step) {
        throw new ActionNotFoundExeption(SightPhrases.undefinedActionType);
      }

      const handler = this.stepHandlers[step];
      if (handler) {
        await handler.call(this, ctx, message);
      }
    } catch (error) {
      await handleErrorResponse(ctx, error);
    }
  }

  @Action(SightActionEnum.continue)
  private async continueSightsInfo(@Ctx() ctx: Context) {
    try {
      const sightsXids = ctx.session.__scenes.state.sessionData.sightsXids;
      const chunk = sightsXids.splice(0, 5);

      const sightInfoPromises = chunk.map((sight) =>
        getSightInfo(sight.properties.xid),
      );
      const answered = await Promise.all(sightInfoPromises);

      const formattedResponse = formatSightsInfo(answered);

      if (!formattedResponse.length) {
        throw new SightsNotFoundExeption(SightPhrases.notFoundSight);
      }

      if (sightsXids.length === 0) {
        await this.handleSceneCompletion(ctx, formattedResponse);
        return;
      }

      if (ctx.has(callbackQuery('data'))) {
        await ctx.editMessageText(formattedResponse, continueSightButtons());
      } else {
        await ctx.sendMessage(formattedResponse, continueSightButtons());
      }
    } catch (error) {
      await handleErrorResponse(ctx, error);
    }
  }

  private async handleSceneCompletion(ctx: Context, response: string) {
    if (ctx.has(callbackQuery('data'))) {
      await ctx.editMessageText(response);
      await ctx.scene.reenter();
    } else {
      await ctx.sendMessage(response, actionButtons());
      await ctx.scene.leave();
    }
  }
}
