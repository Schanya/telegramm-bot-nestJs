import { Action, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { sightButtons } from '../buttons/sight/start.button';
import { Context } from '../interfaces/context.interface';
import { SceneEnum } from './enums/scene.enum';
import { axiosDownload } from './help/httpRequest';
import { SightRequestParamsDto } from './dto/sight.dto';
import { sightTypeButtons } from '../buttons/sight/sight-type.button';
import { SightType } from './types/sight.type';
import { SIGHT_TYPE } from '../сonstants/sight.constants';
import { callbackQuery } from 'telegraf/filters';

@Scene(SceneEnum.sightScene)
export class SightService {
  constructor() {}

  @SceneEnter()
  async startSightScene(@Ctx() ctx: Context) {
    await ctx.sendMessage(
      'Какие достопримечательности хотите найти?',
      sightTypeButtons(),
    );
  }

  @Action(Object.keys(SIGHT_TYPE))
  async whereSight(@Ctx() ctx: Context) {
    if (ctx.has(callbackQuery('data'))) {
      ctx.session.__scenes.state.sightType = ctx.callbackQuery
        .data as SightType;
      await ctx.sendMessage('Где искать?', sightButtons());
    }
  }

  @On('location')
  async getSightNearby(
    @Ctx() ctx: Context,
    @Message() message: MessageType.LocationMessage,
  ) {
    const kinds = ctx.session.__scenes.state.sightType;
    const { latitude, longitude } = message.location;

    const params: SightRequestParamsDto = {
      lat: latitude,
      lon: longitude,
      radius: 1000,
      apikey: process.env.SIGHTS_KEY,
      kinds,
    };

    const { data } = await this.findSight(
      process.env.SIGHTS_URL + '/radius',
      params,
    );
    let sights = data['features'];
    let answerd = '';

    for (let i = 0; i < sights.length; i++) {
      const xid = sights[i].properties.xid;
      let { data } = await this.findSight(
        process.env.SIGHTS_URL + `/xid/${xid}`,
        { apikey: process.env.SIGHTS_KEY },
      );
      answerd += data;
    }
    sights = sights.map((el) => el.properties.name).join('\n');

    ctx.sendMessage(sights);
  }

  async findSight(url: string, params?: SightRequestParamsDto) {
    return await axiosDownload(url, params);
  }
}
