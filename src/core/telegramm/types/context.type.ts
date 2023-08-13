import { TaskContextStepEnum } from '../services/enums/task-context-step.enum';

export type ContextData =
  | 'weather'
  | 'subscription'
  | 'sightCity'
  | TaskContextStepEnum;
