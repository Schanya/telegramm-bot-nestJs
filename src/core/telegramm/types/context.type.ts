import { TaskContextStepEnum } from '../scenes/task/enums/task-context-step.enum';
import { WeatherContextStepEnum } from '../scenes/weather/enums/weather-context-step.enum';

export type ContextData =
  | WeatherContextStepEnum
  | 'sightCity'
  | TaskContextStepEnum;
