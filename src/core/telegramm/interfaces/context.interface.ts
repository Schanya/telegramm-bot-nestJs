import { SceneContext } from 'telegraf/typings/scenes';
import { MySceneSession } from './session.interface';
import { SceneEnum } from '../services/enums/scene.enum';

export interface Context extends SceneContext<MySceneSession> {
  state: {
    city: string;
    evenType: EventType;
    preventScene: SceneEnum;
    preventSceneData: string;
  };
}
