import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { CreateCityDto } from 'src/core/city/dto/create-city.dto';
import { CreateUserDto } from 'src/core/user/dto/create-user.dto';
import { CreateEventDto } from 'src/core/event/dto/create-event.dto';
import { UserService } from 'src/core/user/user.service';
import { UserDataDto } from 'src/core/user/dto/user-data.dto';
import { timeButtons } from '../buttons/time.button';
import { TimeActionType } from './types/timeAction.type';
import { TimeDto } from './dto/time.dto';
import { SceneEnum } from './enums/scene.enum';

@Scene(SceneEnum.timeScene)
export class TimeService {
  constructor(private readonly userService: UserService) {}

  @SceneEnter()
  async startTimeScene(@Ctx() ctx: Context) {
    console.log(ctx.session['data']);
    const initialTime = { hours: 0, minutes: 0 };

    await ctx.reply('Введите время, в которое хотите получать обновления');
    await ctx.reply(
      `Текущее время: ${initialTime.hours}:${initialTime.minutes}`,
      timeButtons(),
    );
  }

  @On('callback_query')
  async timeButtonsHandler(@Ctx() ctx: Context) {
    const action = ctx.callbackQuery['data'];
    const message = ctx.callbackQuery.message['text'];
    const currentTime = this.parseTime(message);

    await this.handleTimeAction(action, currentTime, ctx);
  }

  async handleTimeAction(
    action: TimeActionType,
    currentTime: TimeDto,
    @Ctx() ctx: Context,
  ) {
    switch (action) {
      case 'increaseHours':
        currentTime.hours = (currentTime.hours + 1) % 24;
        break;
      case 'decreaseHours':
        currentTime.hours = (currentTime.hours - 1 + 24) % 24;
        break;
      case 'increaseMinutes':
        currentTime.minutes = (currentTime.minutes + 15) % 60;
        if (currentTime.minutes === 0) {
          currentTime.hours = (currentTime.hours + 1) % 24;
        }
        break;
      case 'decreaseMinutes':
        currentTime.minutes = (currentTime.minutes - 15 + 60) % 60;
        if (currentTime.minutes === 45) {
          currentTime.hours = (currentTime.hours - 1 + 24) % 24;
        }
      case 'done':
        await this.handleDoneAction(ctx, currentTime);
        break;
      default:
        return;
    }

    this.updateMessage(ctx, currentTime);
  }

  async handleDoneAction(@Ctx() ctx: Context, currentTime: TimeDto) {
    ctx.reply(`Вы выбрали время: ${this.formatTime(currentTime)}`);

    const cityInfo: CreateCityDto = { name: ctx.session['data'].city };
    const userInfo: CreateUserDto = {
      name: ctx.callbackQuery.from.first_name,
      telegrammID: ctx.callbackQuery.from.id,
    };
    const eventInfo: CreateEventDto = {
      time: new Date(0, 0, 0, currentTime.hours, currentTime.minutes),
      type: ctx.session['data'].sessionID,
    };

    const userData: UserDataDto = { cityInfo, userInfo, eventInfo };

    await this.userService
      .saveUserWithData(userData)
      .then(() => {
        ctx.reply(
          'Данные успешно сохранены, теперь вы будете получать уведомления',
        );
        ctx.scene.leave();
      })
      .catch((e) => ctx.reply(`${e.message}`));
  }

  updateMessage(@Ctx() ctx: Context, currentTime: TimeDto) {
    ctx
      .editMessageText(
        `Текущее время: ${this.formatTime(currentTime)}`,
        timeButtons(),
      )
      .catch(() => {});
  }

  formatTime(currentTime: TimeDto) {
    return `${String(currentTime.hours).padStart(2, '0')}:${String(
      currentTime.minutes,
    ).padStart(2, '0')}`;
  }

  parseTime(timeString: string) {
    const [hours, minutes] = timeString.match(/\d+/g).map(Number);
    return { hours, minutes };
  }
}
