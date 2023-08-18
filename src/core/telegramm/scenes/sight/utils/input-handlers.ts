import { Message as MessageType } from 'telegraf/typings/core/types/typegram';

import { Context } from '@telegramm/interfaces';
import { SightRequestParams } from '../dto';
import { SightContextStepEnum, SightPhrases } from '../enums';
import { getCityGeoData, getSights } from './http-requests';

export async function handleCityInput(ctx: Context) {
  await ctx.sendMessage(SightPhrases.enterCityName, {
    reply_markup: { remove_keyboard: true },
  });

  ctx.session.__scenes.step = SightContextStepEnum.cityName;
}

export async function handleCityNameInput(
  ctx: Context,
  message: MessageType.TextMessage,
) {
  const cityName = message.text;
  const cityGeoDataParams: SightRequestParams = { name: cityName };

  const cityGeoData = await getCityGeoData(cityGeoDataParams);

  if (cityGeoData.name !== cityName) {
    await ctx.sendMessage(
      SightPhrases.incorrectCityName(cityGeoData.name, cityName),
    );
  }

  const { lat, lon } = cityGeoData;
  const kinds = ctx.session.__scenes.state.sessionData.sight.type;
  const sightRequestParams: SightRequestParams = { lat, lon, kinds };

  const sightsXids = await getSights(sightRequestParams);
  ctx.session.__scenes.state.sessionData.sightsXids = sightsXids;

  await this.continueSightsInfo(ctx);
}
