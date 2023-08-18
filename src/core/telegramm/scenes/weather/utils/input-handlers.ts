import { Context } from 'src/core/telegramm/interfaces/context.interface';
import { getWeather } from './http-request';
import { WeatherPhrases } from '../enums';
import { actionButtons } from 'src/core/telegramm/buttons/actions.button';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { CreateWeatherNotificationParams } from '../dto';
import { SubscriptionExeption } from 'src/core/telegramm/errors';
import { dateToTimeDto, formatTime } from '../../utils';
import { Event } from 'src/core/event/event.model';
import { SceneEnum } from 'src/core/telegramm/enums/scene.enum';
import { City } from 'src/core/city/city.model';
import { railwayServiceTimeZoneOffset } from 'src/core/telegramm/enums/time-zone';

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
  weather: CreateWeatherNotificationParams,
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
