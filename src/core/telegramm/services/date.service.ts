import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneEnum } from './enums/scene.enum';
import { Context } from '../interfaces/context.interface';
import { callbackQuery } from 'telegraf/filters';

@Scene(SceneEnum.dateScene)
export class DateService {
  @SceneEnter()
  async startCalendar(@Ctx() ctx: Context) {
    ctx.session.__scenes.state.preventScene = ctx.state.preventScene;
    ctx.session.__scenes.state.preventSceneData = ctx.state.preventSceneData;

    this.viewCal(new Date().getFullYear(), new Date().getMonth(), ctx);
  }

  @On('callback_query')
  async handleCalendarAction(@Ctx() ctx: Context) {
    if (ctx.has(callbackQuery('data'))) {
      const params = ctx.callbackQuery.data.split('_');
      const chatId = ctx.chat.id;

      switch (params[0]) {
        case 'info': {
          params.shift();

          ctx.state.city = params.join('-');
          ctx.state.preventSceneData =
            ctx.session.__scenes.state.preventSceneData;

          const preventScene = ctx.session.__scenes.state.preventScene;
          ctx.scene.enter(preventScene);
          break;
        }

        case 'cal': {
          this.viewCal(Number(params[1]), Number(params[2]), ctx);
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

  viewCal(year: number, month: number, @Ctx() ctx: Context) {
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

    dayLines.forEach((line) => {
      buttons[buttons.length] = [];
      line.forEach((day) => {
        buttons[buttons.length - 1].push({
          text: day,
          callback_data:
            day > 0
              ? 'info_' + this.setBeforeZero(day) + '-' + current_info
              : 'inline',
        });
      });
    });

    let data = {
      reply_markup: { inline_keyboard: buttons },
    };

    const messageId = ctx.callbackQuery?.message?.message_id;

    if (messageId) {
      ctx.editMessageText('Календарь', data);
    } else {
      ctx.sendMessage('Календарь', data);
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

  /**
   * Переопределим номер дня недели
   * @param date
   * @return int
   */
  getNumDayOfWeek(date): number {
    let day = date.getDay();

    return day === 0 ? 6 : day - 1;
  }
}
