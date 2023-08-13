import { weather } from 'env';

export const WeatherRequestParamsConstants = {
  lang: 'ru',
  appid: weather.key,
  units: 'metric',
};
