import { SceneSessionData } from 'telegraf/typings/scenes';
import { ContextData } from '../types/context.type';
import { SessionContext } from 'telegraf/typings/session';

export interface MySceneSession extends SceneSessionData {
  type: ContextData;
  state: {
    city: string;
    evenType: EventType;
  };
}
