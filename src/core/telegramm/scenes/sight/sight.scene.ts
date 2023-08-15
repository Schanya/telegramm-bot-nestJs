import { BadRequestException, NotFoundException } from '@nestjs/common';
import { sight } from 'env';
import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { callbackQuery } from 'telegraf/filters';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { actionButtons } from '../../buttons/actions.button';
import { SceneEnum } from '../../enums/scene.enum';
import { SightsNotFoundExeption } from '../../errors';
import { Context } from '../../interfaces/context.interface';
import { formatAddress, formatSightsInfo } from '../utils';
import { axiosDownload } from '../utils/httpRequest';
import { sightTypeButtons } from './buttons/sight-type.button';
import { sightButtons } from './buttons/start.button';
import {
  CityGeoData,
  CreateSightParams,
  SightRequestParams,
  SigthXidsDto,
} from './dto';
import { SightContextStepEnum } from './enums/sight-context-step.enum';
import {
  DEFAULT_REQUEST_PARAMS,
  GEONAME_URL,
  RADIUS_URL,
  XID_URL,
} from './enums/sight-request-params.constants';
import { SIGHT_TYPE } from './enums/sight-type.constants';
import { SightPhrases } from './enums/sight.phrases';
import { SightType } from './types/sight.type';
import { SightActionEnum } from './enums/sight-action.enum';

@Scene(SceneEnum.sightScene)
export class SightScene {
  constructor() {}

  private stepHandlers = {
    cityNearby: this.handleCityInput,
    cityName: this.handleCityNameInput,
  };

  @SceneEnter()
  async startSightScene(@Ctx() ctx: Context) {
    ctx.session.__scenes.state.sight = {};
    await ctx.sendMessage(SightPhrases.start, sightTypeButtons());
  }

  @Action(Object.keys(SIGHT_TYPE))
  async whereSight(@Ctx() ctx: Context) {
    if (ctx.has(callbackQuery('data'))) {
      await ctx.answerCbQuery();

      ctx.session.__scenes.state.sight.type = ctx.callbackQuery
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
      const kinds = ctx.session.__scenes.state.sight.type;

      if (!kinds) {
        throw new BadRequestException(SightPhrases.undefinedSightType);
      }

      const { latitude: lat, longitude: lon } = message.location;
      const sightRequestParams: SightRequestParams = { lat, lon, kinds };

      const sightsXids = await this.getSights(sightRequestParams);

      const sightInfoPromises = sightsXids.map((sight) =>
        this.getSightInfo(sight.properties.xid),
      );
      const answerd = await Promise.all(sightInfoPromises);

      const formattedResponse = formatSightsInfo(answerd);

      await ctx.sendMessage(formattedResponse, actionButtons());
      await ctx.scene.leave();
    } catch (error) {
      if (error?.name == 'SightsNotFoundExeption') {
        ctx.session.__scenes.step = SightContextStepEnum.cityNearby;
        await ctx.sendMessage(error.message, sightTypeButtons());
      } else {
        await ctx.sendMessage(error.message);
      }
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
        throw new BadRequestException(SightPhrases.undefinedActionType);
      }

      const handler = this.stepHandlers[step];
      if (handler) {
        await handler.call(this, ctx, message);
      }
    } catch (error) {
      if (error?.name == 'SightsNotFoundExeption') {
        ctx.session.__scenes.step = SightContextStepEnum.cityNearby;
        await ctx.sendMessage(error.message, sightTypeButtons());
      } else {
        await ctx.sendMessage(error.message);
      }
    }
  }

  private async handleCityInput(@Ctx() ctx: Context) {
    await ctx.sendMessage(SightPhrases.enterCityName, {
      reply_markup: { remove_keyboard: true },
    });

    ctx.session.__scenes.step = SightContextStepEnum.cityName;
  }

  private async handleCityNameInput(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    const cityName = message.text;
    const cityGeoDataParams: SightRequestParams = { name: cityName };

    const cityGeoData = await this.getCityGeoData(cityGeoDataParams);

    if (cityGeoData.name !== cityName) {
      await ctx.sendMessage(
        SightPhrases.incorrectCityName(cityGeoData.name, cityName),
      );
    }

    const { lat, lon } = cityGeoData;
    const kinds = ctx.session.__scenes.state.sight.type;
    const sightRequestParams: SightRequestParams = { lat, lon, kinds };

    const sightsXids = await this.getSights(sightRequestParams);

    const sightInfoPromises = sightsXids.map((sightXid) =>
      this.getSightInfo(sightXid.properties.xid),
    );
    const response = await Promise.all(sightInfoPromises);
    const formattedResponse = formatSightsInfo(response);

    await ctx.sendMessage(formattedResponse, actionButtons());
    await ctx.scene.leave();
  }

  private async getCityGeoData(
    cityGeoDataParams: SightRequestParams,
  ): Promise<CityGeoData> {
    const { data: cityGeoData } = await this.sendSightApiRequest(
      sight.url + GEONAME_URL,
      cityGeoDataParams,
    );

    if (cityGeoData?.error) {
      throw new NotFoundException(SightPhrases.notFoundCity);
    }

    return cityGeoData;
  }

  private async getSights(
    sightRequestParams: SightRequestParams,
  ): Promise<SigthXidsDto[]> {
    try {
      const { data } = await this.sendSightApiRequest(
        sight.url + RADIUS_URL,
        sightRequestParams,
      );
      const sightsXids: SigthXidsDto[] = data.features;

      if (!sightsXids.length) {
        throw new SightsNotFoundExeption(SightPhrases.notFoundSight);
      }

      return sightsXids;
    } catch (error) {
      throw new SightsNotFoundExeption(SightPhrases.notFoundSight);
    }
  }

  private async getSightInfo(xid: string): Promise<CreateSightParams> {
    const { data: sightData } = await this.sendSightApiRequest(
      sight.url + `${XID_URL}/${xid}`,
    );

    const formattedAddress = formatAddress(sightData.address);
    const sightInfo: CreateSightParams = {
      address: formattedAddress,
      name: sightData.name,
    };

    return sightInfo;
  }

  async sendSightApiRequest(url: string, params?: SightRequestParams) {
    const response = await axiosDownload(url, {
      ...params,
      apikey: sight.key,
      radius: DEFAULT_REQUEST_PARAMS.radius,
      limit: 3,
    });

    return response;
  }
}
