import { SightContextStepEnum } from '../scenes/sight/enums/sight-context-step.enum';
import { TaskContextStepEnum } from '../scenes/task/enums/task-context-step.enum';
import { WeatherContextStepEnum } from '../scenes/weather/enums/weather-context-step.enum';

export type ContextData =
  | WeatherContextStepEnum
  | SightContextStepEnum
  | TaskContextStepEnum;
