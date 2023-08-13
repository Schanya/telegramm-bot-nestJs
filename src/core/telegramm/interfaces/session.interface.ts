import { SceneSessionData } from 'telegraf/typings/scenes';
import { SceneEnum } from '../enums/scene.enum';
import { SightType } from '../scenes/sight/types/sight.type';
import { CreateTaskParams } from '../scenes/task/dto/task.dto';
import { CreateWeatherNotificationParams } from '../scenes/weather/dto/weather.dto';
import { ContextData } from '../types/context.type';

export interface MySceneSession extends SceneSessionData {
  step: ContextData;
  state: {
    weather: CreateWeatherNotificationParams;
    sightType: SightType;
    task: CreateTaskParams;
    previousScene: SceneEnum;
    previousSceneData: string;
  };
}
