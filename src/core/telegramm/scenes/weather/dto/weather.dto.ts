export class WeatherDto {
  cityName: string;
  description: string;
  temperature: number;
}
export class CreateWeatherNotificationParams {
  cityName?: string;
}

export class WeatherRequestParamsDto {
  q: string;
}
