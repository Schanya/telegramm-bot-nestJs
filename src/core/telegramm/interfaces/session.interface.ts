import { SceneSessionData } from 'telegraf/typings/scenes';
import { ContextData } from '../types/context.type';
import { SightType } from '../services/types/sight.type';
import { ReadAllTaskDto } from 'src/core/task/dto/read-all-tasks.dto';
import { SceneEnum } from '../services/enums/scene.enum';

export interface MySceneSession extends SceneSessionData {
  type: ContextData;
  state: {
    city: string;
    evenType: EventType;
    sightType: SightType;
    task: ReadAllTaskDto;
    preventScene: SceneEnum;
    preventSceneData: string;
  };
}
