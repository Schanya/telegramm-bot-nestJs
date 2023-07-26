import { Context as ContextTelegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

export interface Context extends ContextTelegraf {
  session: {
    type?: { sessionID: string; city: any; time?: any };
  };
}
