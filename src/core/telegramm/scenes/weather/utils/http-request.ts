import { HttpStatusCode } from 'axios';
import { weather } from 'env';
import { InvalidInputExeption } from 'src/core/telegramm/errors';
import { Context } from 'src/core/telegramm/interfaces/context.interface';
import { axiosDownload } from '../../utils';
import { WeatherDto, WeatherRequestParamsDto } from '../dto';
import { WeatherPhrases, WeatherRequestParamsConstants } from '../enums';

export async function getWeather(ctx: Context, city: string) {
  if (/\d+/.test(city)) {
    throw new InvalidInputExeption(WeatherPhrases.cityNameExeption);
  }

  const params: WeatherRequestParamsDto = { q: city };
  const result = await sendWeatherApiRequest(params);

  return result;
}

export async function sendWeatherApiRequest(
  params?: WeatherRequestParamsDto,
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
