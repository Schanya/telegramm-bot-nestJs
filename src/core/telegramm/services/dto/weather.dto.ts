import { WeatherLang, WeatherUnits } from '../types/weather.type';

export class WeatherDto {
  cityName: string;
  description: string;
  temperature: number;
}

export class WeatherParamsDto {
  q: string;
  lang: WeatherLang = 'ru';
  appid: string = process.env.WEATHER_KEY;
  units: WeatherUnits = 'metric';

  constructor(cityName: string) {
    this.q = cityName;
  }
}
