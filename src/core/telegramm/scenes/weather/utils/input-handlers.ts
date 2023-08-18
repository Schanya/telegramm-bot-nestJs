import { Message as MessageType } from 'telegraf/typings/core/types/typegram';

import { Context } from '@telegramm/interfaces';
import { actionButtons } from '@telegramm/buttons';
import { SubscriptionExeption } from '@telegramm/errors';
import { SceneEnum, railwayServiceTimeZoneOffset } from '@telegramm/enums';
import { dateToTimeDto, formatTime } from '@telegramm/scenes/utils';

import { getWeather } from './http-request';
import { WeatherPhrases } from '../enums';
import { NotificationParamsDto } from '../dto';

import { Event } from '@event/event.model';
import { City } from '@city/city.model';

export async function handleGetWeatherInput(
  ctx: Context,
  message: MessageType.TextMessage,
) {
  const messageText = message.text;
  const { cityName, description, temperature } = await getWeather(
    ctx,
    messageText,
  );

  await ctx.sendMessage(
    WeatherPhrases.getWeatherInfo(cityName, description, temperature),
    actionButtons(),
  );

  await ctx.scene.leave();
}

export async function handleSubscriptionInput(
  ctx: Context,
  message: MessageType.TextMessage,
  weather: NotificationParamsDto,
  event: Event,
  userCity: City,
) {
  const messageText = message.text;
  const { cityName } = await getWeather(ctx, messageText);

  if (event) {
    event.time.setHours(event.time.getHours() + railwayServiceTimeZoneOffset);

    throw new SubscriptionExeption(
      WeatherPhrases.subscriptionExeption(
        userCity.name,
        formatTime(dateToTimeDto(event.time)),
      ),
    );
  }

  weather.cityName = cityName;

  ctx.state.previousSceneData = JSON.stringify(weather);
  ctx.state.previousScene = SceneEnum.weatherScene;

  await ctx.scene.leave();
  await ctx.scene.enter(SceneEnum.timeScene, ctx.state);
}
