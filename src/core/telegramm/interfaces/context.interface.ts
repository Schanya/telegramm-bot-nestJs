import { SceneContext } from 'telegraf/typings/scenes';
import { SceneEnum } from '../enums';
import { ContextData } from '../types';
import { MySceneSession } from './session.interface';

export interface Context extends SceneContext<MySceneSession> {
  step: ContextData;
  state: {
    previousScene: SceneEnum;
    previousSceneData: string;
  };
}
