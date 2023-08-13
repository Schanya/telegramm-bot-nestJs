import { SceneContext } from 'telegraf/typings/scenes';
import { MySceneSession } from './session.interface';
import { SceneEnum } from '../enums/scene.enum';
import { EventType } from 'src/core/event/types/event.type';

export interface Context extends SceneContext<MySceneSession> {
  state: {
    previousScene: SceneEnum;
    previousSceneData: string;
  };
}
