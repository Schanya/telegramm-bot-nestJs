import { Markup } from 'telegraf';
import { ActionButtonsEnum } from '../enums';

export function actionButtons() {
  return Markup.keyboard(
    [
      Markup.button.callback(
        ActionButtonsEnum.helpMessage,
        ActionButtonsEnum.helpCallback,
      ),
      Markup.button.callback(
        ActionButtonsEnum.weatherMessage,
        ActionButtonsEnum.weatherCallback,
      ),
      Markup.button.callback(
        ActionButtonsEnum.catMessage,
        ActionButtonsEnum.catCallback,
      ),
      Markup.button.callback(
        ActionButtonsEnum.dogMessage,
        ActionButtonsEnum.dogCallback,
      ),
      Markup.button.callback(
        ActionButtonsEnum.sightMessage,
        ActionButtonsEnum.sightCallback,
      ),
      Markup.button.callback(
        ActionButtonsEnum.taskMessage,
        ActionButtonsEnum.taskCallback,
      ),
    ],
    {
      columns: 3,
    },
  );
}
