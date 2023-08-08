import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { sightButtons } from '../buttons/sight/start.button';
import { Context } from '../interfaces/context.interface';
import { SceneEnum } from './enums/scene.enum';
import { axiosDownload } from './help/httpRequest';
import {
  AddressDto,
  PointDto,
  SightInfoDto,
  SightRequestParamsDto,
  SigthXidsDto,
} from './dto/sight.dto';
import { sightTypeButtons } from '../buttons/sight/sight-type.button';
import { SightType } from './types/sight.type';
import { SIGHT_TYPE } from '../сonstants/sight.constants';
import { callbackQuery } from 'telegraf/filters';
import { SightPhrases } from './enums/phrases/sight.phrases';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { actionButtons } from '../buttons/actions.button';

@Scene(SceneEnum.sightScene)
export class SightService {
  constructor() {}

  @SceneEnter()
  async startSightScene(@Ctx() ctx: Context) {
    await ctx.sendMessage(SightPhrases.start, sightTypeButtons());
  }

  @Action(Object.keys(SIGHT_TYPE))
  async whereSight(@Ctx() ctx: Context) {
    if (ctx.has(callbackQuery('data'))) {
      await ctx.answerCbQuery();

      ctx.session.__scenes.state.sightType = ctx.callbackQuery
        .data as SightType;

      await ctx.sendMessage(SightPhrases.placeQuestion, sightButtons());
    }
  }

  @On('text')
  async getSightCity(
    @Ctx() ctx: Context,
    @Message() message: MessageType.TextMessage,
  ) {
    try {
      const kinds = ctx.session.__scenes.state.sightType;
      const cityName = message.text;
      if (cityName == 'В указанном городе') {
        ctx.sendMessage(SightPhrases.enterCityName, {
          reply_markup: { remove_keyboard: true },
        });

        ctx.session.__scenes.type = 'sightCity';
      } else {
        if (ctx.session.__scenes.type != 'sightCity') {
          throw new BadRequestException(SightPhrases.undefinedActionType);
        }

        const cityParams = new SightRequestParamsDto();
        cityParams.name = cityName;

        const { data: cityData } = await this.getSight(
          process.env.SIGHTS_URL + '/geoname',
          cityParams,
        );

        if (cityData?.error) {
          throw new NotFoundException(SightPhrases.notFoundCity);
        }

        const { lat, lon } = cityData;
        const params = new SightRequestParamsDto(lat, lon, kinds);

        const { data } = await this.getSight(
          process.env.SIGHTS_URL + '/radius',
          params,
        );
        const sights: SigthXidsDto[] = data.features;

        if (!sights.length) {
          await ctx.scene.reenter();
          throw new NotFoundException(SightPhrases.notFoundSight);
        }

        const sightInfoPromises = sights.map((sight) =>
          this.getSightInfo(sight.properties.xid),
        );
        const answerd = await Promise.all(sightInfoPromises);

        const formattedResponse = this.formatSightInfo(answerd);

        ctx.sendMessage(formattedResponse, actionButtons());
      }
    } catch (error) {
      ctx.sendMessage(SightPhrases.sendError + error.message);
    }
  }

  @On('location')
  async getSightNearby(
    @Ctx() ctx: Context,
    @Message() message: MessageType.LocationMessage,
  ) {
    try {
      const kinds = ctx.session.__scenes.state.sightType;

      if (!kinds) {
        throw new BadRequestException(SightPhrases.undefinedSightType);
      }

      const { latitude: lat, longitude: lon } = message.location;

      const params = new SightRequestParamsDto(lat, lon, kinds);

      const { data } = await this.getSight(
        process.env.SIGHTS_URL + '/radius',
        params,
      );
      const sights: SigthXidsDto[] = data.features;

      if (!sights.length) {
        await ctx.scene.reenter();
        throw new NotFoundException(SightPhrases.notFoundSight);
      }

      const sightInfoPromises = sights.map((sight) =>
        this.getSightInfo(sight.properties.xid),
      );
      const answerd = await Promise.all(sightInfoPromises);

      const formattedResponse = this.formatSightInfo(answerd);

      ctx.sendMessage(formattedResponse, actionButtons());
      await ctx.scene.leave();
    } catch (error) {
      ctx.sendMessage(SightPhrases.sendError + error.message);
    }
  }

  async getSightInfo(xid: string) {
    const { data } = await this.getSight(
      process.env.SIGHTS_URL + `/xid/${xid}`,
      new SightRequestParamsDto(),
    );

    const formattedAddress = this.formatAddress(data.address);
    const formattedCoordinates = this.formatCoordinates(data.point);

    return new SightInfoDto(data.name, formattedAddress, formattedCoordinates);
  }

  formatSightInfo(sightInfoList: SightInfoDto[]) {
    return sightInfoList
      .map((el) => SightPhrases.sendSightInfo(el))
      .join('\n\n');
  }

  formatAddress(address: AddressDto) {
    return `${address.road} ${address.house_number}`;
  }

  formatCoordinates(point: PointDto) {
    return `${point.lon}\n${point.lat}`;
  }

  async getSight(url: string, params?: SightRequestParamsDto) {
    try {
      const response = await axiosDownload(url, params);

      return response;
    } catch (error) {
      throw new BadRequestException(SightPhrases.cityNameMistake);
    }
  }
}
