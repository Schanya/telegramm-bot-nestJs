import { SceneContext } from 'telegraf/typings/scenes';
import { MySceneSession } from './session.interface';

export interface Context extends SceneContext<MySceneSession> {
  state: {
    city: string;
    evenType: EventType;
  };
}
