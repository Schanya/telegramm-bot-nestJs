import { SceneContext } from 'telegraf/typings/scenes';

export interface Context extends SceneContext {
  data: { type: string };
}