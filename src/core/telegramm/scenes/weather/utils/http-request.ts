import { weather } from 'env';

import { HttpStatusCode } from 'axios';

import { InvalidInputExeption } from '@telegramm/errors';
import { Context } from '@telegramm/interfaces';
import { axiosDownload } from '@telegramm/scenes/utils';

import { WeatherDto, RequestParamsDto } from '../dto';
import { WeatherPhrases, WeatherRequestParamsConstants } from '../enums';

export async function getWeather(ctx: Context, city: string) {
  if (/\d+/.test(city)) {
    throw new InvalidInputExeption(WeatherPhrases.cityNameExeption);
  }

  const params: RequestParamsDto = { q: city };
  const result = await sendWeatherApiRequest(params);

  return result;
}

export async function sendWeatherApiRequest(
  params?: RequestParamsDto,
): Promise<WeatherDto> {
  try {
    const { data } = await axiosDownload(weather.url, {
      ...params,
      ...WeatherRequestParamsConstants,
    });

    const cityName = data.name;
    const weatherDescription = data.weather[0].description;
    const temperature = Number(data.main.temp);

    const result: WeatherDto = {
      cityName,
      description: weatherDescription,
      temperature,
    };
    return result;
  } catch (error) {
    if (error.response.status == HttpStatusCode.NotFound) {
      throw new InvalidInputExeption(WeatherPhrases.cityNameExeption);
    }
  }
}
