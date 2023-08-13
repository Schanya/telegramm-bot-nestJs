import { WeatherLang, WeatherUnits } from '../types/weather.type';
import { weather } from 'env';

export class WeatherDto {
  cityName: string;
  description: string;
  temperature: number;
}

export class WeatherParamsDto {
  q: string;
  lang: WeatherLang = 'ru';
  appid: string = weather.key;
  units: WeatherUnits = 'metric';

  constructor(cityName: string) {
    this.q = cityName;
  }
}
