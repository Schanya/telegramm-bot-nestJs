import { SceneSessionData } from 'telegraf/typings/scenes';
import { SceneEnum } from '../enums';
import { ContextData, SessionData } from '../types';

export interface MySceneSession extends SceneSessionData {
  step: ContextData;
  state: {
    sessionData: SessionData;
    previousScene: SceneEnum;
    previousSceneData: string;
  };
}
