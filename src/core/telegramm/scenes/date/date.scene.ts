import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { callbackQuery } from 'telegraf/filters';

import { SceneEnum } from '@telegramm/enums';
import { Context } from '@telegramm/interfaces';
import { formatDate } from '../utils';

@Scene(SceneEnum.dateScene)
export class DateScene {
  @SceneEnter()
  async startCalendar(@Ctx() ctx: Context) {
    ctx.session.__scenes.state.previousScene = ctx.state.previousScene;
    ctx.session.__scenes.state.previousSceneData = ctx.state.previousSceneData;
    ctx.session.__scenes.step = ctx.step;

    await this.viewCal(new Date().getFullYear(), new Date().getMonth(), ctx);
  }

  @On('callback_query')
  async handleCalendarAction(@Ctx() ctx: Context) {
    if (ctx.has(callbackQuery('data'))) {
      await ctx.answerCbQuery();
      const params = ctx.callbackQuery.data.split('_');

      switch (params[0]) {
        case 'info': {
          params.shift();

          const date = formatDate(params.join('-'));

          const previousSceneData = JSON.parse(
            ctx.session.__scenes.state.previousSceneData,
          );
          previousSceneData.date = date;
          ctx.state.previousSceneData = JSON.stringify(previousSceneData);

          ctx.step = ctx.session.__scenes.step;

          const previousScene = ctx.session.__scenes.state.previousScene;
          await ctx.scene.enter(previousScene);
          break;
        }

        case 'cal': {
          await this.viewCal(Number(params[1]), Number(params[2]), ctx);
          break;
        }

        default:
          break;
      }
    }
  }

  setBeforeZero(num: number): string {
    return ('0' + num).slice(-2);
  }

  async viewCal(year: number, month: number, @Ctx() ctx: Context) {
    let dayLines = this.getDays(year, month);
    let currentMonthDate = new Date(+year, +month);

    let prevMonthDate = new Date(
      new Date(currentMonthDate).setMonth(currentMonthDate.getMonth() - 1),
    );
    let nextMonthDate = new Date(
      new Date(currentMonthDate).setMonth(currentMonthDate.getMonth() + 1),
    );

    let current_info =
      this.setBeforeZero(currentMonthDate.getMonth() + 1) +
      '-' +
      currentMonthDate.getFullYear();

    let buttons = [];
    buttons.push([
      {
        text: '<<<',
        callback_data:
          'cal_' + prevMonthDate.getFullYear() + '_' + prevMonthDate.getMonth(),
      },
      {
        text: current_info,
        callback_data: 'info_' + current_info,
      },
      {
        text: '>>>',
        callback_data:
          'cal_' + nextMonthDate.getFullYear() + '_' + nextMonthDate.getMonth(),
      },
    ]);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    dayLines.forEach((line) => {
      buttons[buttons.length] = [];
      line.forEach((day) => {
        if (day > 0) {
          let dayDate = new Date(
            currentMonthDate.getFullYear(),
            currentMonthDate.getMonth(),
            day,
          );
          let callbackData =
            dayDate >= currentDate
              ? 'info_' + this.setBeforeZero(day) + '-' + current_info
              : 'inline';

          buttons[buttons.length - 1].push({
            text: day,
            callback_data: callbackData,
          });
        } else {
          buttons[buttons.length - 1].push({
            text: ' ',
            callback_data: 'inline',
          });
        }
      });
    });

    let data = {
      reply_markup: { inline_keyboard: buttons },
    };

    const messageId = ctx.callbackQuery?.message?.message_id;

    if (messageId) {
      await ctx.editMessageText('Календарь', data);
    } else {
      await ctx.sendMessage('Календарь', data);
    }

    return data;
  }

  getDays(year: number, month: number): Array<Array<number>> {
    let d = new Date(year, month);
    let days = [];

    days[days.length] = [];

    for (let i = 0; i < this.getNumDayOfWeek(d); i++) {
      days[days.length - 1].push('-');
    }

    while (d.getMonth() === +month) {
      days[days.length - 1].push(d.getDate());

      if (this.getNumDayOfWeek(d) % 7 === 6) {
        days[days.length] = [];
      }

      d.setDate(d.getDate() + 1);
    }

    if (this.getNumDayOfWeek(d) !== 0) {
      for (let i = this.getNumDayOfWeek(d); i < 7; i++) {
        days[days.length - 1].push('-');
      }
    }

    return days;
  }

  getNumDayOfWeek(date): number {
    let day = date.getDay();

    return day === 0 ? 6 : day - 1;
  }
}
