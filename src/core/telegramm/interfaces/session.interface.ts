import { SceneSessionData } from 'telegraf/typings/scenes';
import { ContextData } from '../types/context.type';
import { SessionContext } from 'telegraf/typings/session';
import { SightType } from '../services/types/sight.type';

export interface MySceneSession extends SceneSessionData {
  type: ContextData;
  state: {
    city: string;
    evenType: EventType;
    sightType: SightType;
  };
}
