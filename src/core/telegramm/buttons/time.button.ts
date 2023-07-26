import {
  Ctx,
  InjectBot,
  Message,
  On,
  Scene,
  SceneEnter,
} from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { Context } from '../interfaces/context.interface';
import { SceneContext } from 'telegraf/typings/scenes';
import { CityService } from 'src/core/city/city.service';
import { UserService } from 'src/core/user/user.service';
import { EventService } from 'src/core/event/event.service';

@Scene('timeScene')
export class TimeHandler {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly cityService: CityService,
    private readonly userSrvice: UserService,
    private readonly eventService: EventService,
  ) {}
  timeButtons() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('🔺', 'increaseHours'),
        Markup.button.callback('🔺', 'increaseMinutes'),
      ],
      [
        Markup.button.callback('🔽', 'decreaseHours'),
        Markup.button.callback('🔽', 'decreaseMinutes'),
      ],
      [Markup.button.callback('✅ Готово', 'done')],
    ]);
  }

  @SceneEnter()
  async startTimeScene(@Ctx() ctx: Context, @Ctx() context: Context) {
    const initialTime = { hours: 0, minutes: 0 };

    await ctx.reply('Введите время, в которое хотите получать обновления');
    await ctx.reply(
      `Текущее время: ${initialTime.hours}:${initialTime.minutes}`,
      this.timeButtons(),
    );
  }

  @On('callback_query')
  async timeButtonsHandler(@Ctx() ctx: SceneContext, @Ctx() context: Context) {
    const action = ctx.callbackQuery['data'];
    const message = ctx.callbackQuery.message['text'];
    const currentTime = this.parseTime(message);

    switch (action) {
      case 'increaseHours':
        if (currentTime.hours == 24) {
          currentTime.hours = 0;
        } else {
          currentTime.hours++;
        }
        this.updateMessage(ctx, currentTime);
        break;
      case 'decreaseHours':
        if (currentTime.hours == 0) break;
        currentTime.hours--;
        this.updateMessage(ctx, currentTime);
        break;
      case 'increaseMinutes':
        if (currentTime.minutes == 60) {
          currentTime.minutes = 0;
          currentTime.hours++;
        } else {
          currentTime.minutes += 15;
        }
        this.updateMessage(ctx, currentTime);
        break;
      case 'decreaseMinutes':
        if (currentTime.minutes == 0) break;
        currentTime.minutes -= 15;
        this.updateMessage(ctx, currentTime);
        break;
      case 'done':
        ctx.reply(
          `Вы выбрали время: ${this.formatTime(
            currentTime.hours,
            currentTime.minutes,
          )}`,
        );
        context.session['time'] = currentTime;

        await this.saveToDb(ctx.session['data'].city, context, currentTime);
        ctx.scene.leave();
        return;
      default:
        break;
    }
  }

  async saveToDb(city: string, ctx: Context, currentTime) {
    let existingCity = await this.cityService.findBy({
      name: city,
    });
    if (!existingCity) {
      existingCity = await this.cityService.create({ name: city });
    }

    let existingUser = await this.userSrvice.findBy({
      telegrammID: ctx.callbackQuery.from.id,
    });
    if (!existingUser) {
      existingUser = await this.userSrvice.create({
        name: ctx.callbackQuery.from.first_name,
        telegrammID: ctx.callbackQuery.from.id,
      });
    }

    let event = await this.eventService.create({
      time: new Date(0, 0, 0, currentTime.hours, currentTime.minutes),
      type: 'weather',
    });

    await existingCity.$add('user', existingUser);
    await event.$add('user', existingUser);

    await this.bot.telegram.sendMessage(
      ctx.callbackQuery.from.id,
      'Данные сохранены, теперь вы будуте получать рассылку',
    );
  }

  updateMessage(
    @Ctx() ctx: SceneContext,
    currentTime: { hours: number; minutes: number },
  ) {
    ctx.editMessageText(
      `Текущее время: ${this.formatTime(
        currentTime.hours,
        currentTime.minutes,
      )}`,
      this.timeButtons(),
    );
  }

  // Функция для форматирования времени в строку (дополняет нулями)
  formatTime(hours: number, minutes: number) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}`;
  }

  // Функция для разбора времени из строки (возвращает объект {hours, minutes})
  parseTime(timeString: string) {
    const [hours, minutes] = timeString.match(/\d+/g).map(Number);
    return { hours, minutes };
  }
}
