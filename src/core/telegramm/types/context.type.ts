import { TaskContextStepEnum } from '../scenes/task/enums/task-context-step.enum';

export type ContextData =
  | 'weather'
  | 'subscription'
  | 'sightCity'
  | TaskContextStepEnum;
