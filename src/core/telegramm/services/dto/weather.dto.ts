import { WeatherLang, WeatherUnits } from '../types/weather.type';

export class WeatherDto {
  description: string;
  temperature: number;
}

export class WeatherParamsDto {
  q: string;
  lang: WeatherLang;
  appid: string;
  units: WeatherUnits;
}
