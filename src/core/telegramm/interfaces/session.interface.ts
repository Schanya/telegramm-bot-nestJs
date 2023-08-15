import { SceneSessionData } from 'telegraf/typings/scenes';
import { SceneEnum } from '../enums/scene.enum';
import { CreateTaskParams } from '../scenes/task/dto/task.dto';
import { CreateWeatherNotificationParams } from '../scenes/weather/dto/weather.dto';
import { ContextData } from '../types/context.type';
import { CreateSightParams } from '../scenes/sight/dto';

export interface MySceneSession extends SceneSessionData {
  step: ContextData;
  state: {
    weather: CreateWeatherNotificationParams;
    sight: CreateSightParams;
    task: CreateTaskParams;
    previousScene: SceneEnum;
    previousSceneData: string;
  };
}
