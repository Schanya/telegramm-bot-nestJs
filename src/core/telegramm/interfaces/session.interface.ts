import { SceneSessionData } from 'telegraf/typings/scenes';
import { SceneEnum } from '../enums/scene.enum';
import { ContextData } from '../types/context.type';
import { SessionData } from '../types/session-data.type';

export interface MySceneSession extends SceneSessionData {
  step: ContextData;
  state: {
    sessionData: SessionData;
    previousScene: SceneEnum;
    previousSceneData: string;
  };
}
