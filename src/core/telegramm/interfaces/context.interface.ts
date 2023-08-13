import { SceneContext } from 'telegraf/typings/scenes';
import { SceneEnum } from '../enums/scene.enum';
import { ContextData } from '../types/context.type';
import { MySceneSession } from './session.interface';

export interface Context extends SceneContext<MySceneSession> {
  ctx: {};
  step: ContextData;
  state: {
    previousScene: SceneEnum;
    previousSceneData: string;
  };
}
