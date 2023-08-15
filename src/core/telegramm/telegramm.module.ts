import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { telegramm } from 'env';
import { TelegrafModule } from 'nestjs-telegraf';
import { CityModule } from 'src/core/city/city.module';
import { UserModule } from 'src/core/user/user.module';
import { EventModule } from '../event/event.module';
import { TaskModule } from '../task/task.module';
import { TelegrammController } from './controllers/telegramm.controller';
import { sessionMiddleware } from './middleware/session.middleware';
import { CatScene } from './scenes/cat/cat.scene';
import { DateScene } from './scenes/date/date.scene';
import { DogScene } from './scenes/dog/dog.scene';
import { HelpScene } from './scenes/help/help.scene';
import { NotificationScene } from './scenes/notification/notification.scene';
import { SightScene } from './scenes/sight/sight.scene';
import { TaskScene } from './scenes/task/task.scene';
import { TimeScene } from './scenes/time/time.scene';
import { WeatherScene } from './scenes/weather/weather.scene';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: telegramm.token,
      middlewares: [sessionMiddleware],
      include: [TelegrammModule],
    }),
    UserModule,
    CityModule,
    EventModule,
    TaskModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    TelegrammController,
    CatScene,
    DogScene,
    HelpScene,
    WeatherScene,
    NotificationScene,
    TimeScene,
    SightScene,
    TaskScene,
    DateScene,
  ],
  exports: [
    TelegrammController,
    CatScene,
    DogScene,
    HelpScene,
    WeatherScene,
    NotificationScene,
    TimeScene,
    SightScene,
    TaskScene,
    DateScene,
  ],
})
export class TelegrammModule {}
