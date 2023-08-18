import { CreateSightParams, SigthXidsDto } from '../scenes/sight/dto';
import { CreateTaskParams } from '../scenes/task/dto';

import { NotificationParamsDto } from '../scenes/weather/dto';

export type SessionData = {
  weather?: NotificationParamsDto;
  sight?: CreateSightParams;
  sightsXids?: SigthXidsDto[];
  task?: CreateTaskParams;
};
