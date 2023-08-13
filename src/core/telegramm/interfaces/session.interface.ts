import { SceneSessionData } from 'telegraf/typings/scenes';
import { ContextData } from '../types/context.type';
import { SightType } from '../scenes/sight/types/sight.type';
import { ReadAllTaskDto } from 'src/core/task/dto/read-all-tasks.dto';
import { SceneEnum } from '../enums/scene.enum';
import { CreateWeatherNotificationParams } from '../scenes/weather/dto/weather.dto';
import { EventType } from 'src/core/event/types/event.type';

export interface MySceneSession extends SceneSessionData {
  step: ContextData;
  state: {
    weather: CreateWeatherNotificationParams;
    sightType: SightType;
    task: ReadAllTaskDto;
    previousScene: SceneEnum;
    previousSceneData: string;
  };
}
