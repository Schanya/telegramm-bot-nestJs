import { CreateSightParams, SigthXidsDto } from '../scenes/sight/dto';
import { CreateTaskParams } from '../scenes/task/dto/task.dto';
import { CreateWeatherNotificationParams } from '../scenes/weather/dto/weather.dto';

export type SessionData = {
  weather?: CreateWeatherNotificationParams;
  sight?: CreateSightParams;
  sightsXids?: SigthXidsDto[];
  task?: CreateTaskParams;
};
