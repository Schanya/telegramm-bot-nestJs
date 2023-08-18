import { SightContextStepEnum } from '../scenes/sight/enums';
import { TaskContextStepEnum } from '../scenes/task/enums';
import { WeatherContextStepEnum } from '../scenes/weather/enums';

export type ContextData =
  | WeatherContextStepEnum
  | SightContextStepEnum
  | TaskContextStepEnum;
