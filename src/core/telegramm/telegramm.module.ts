import { telegramm } from 'env';

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegrafModule } from 'nestjs-telegraf';

import { CityModule } from '@city/city.module';
import { UserModule } from '@user/user.module';
import { EventModule } from '@event/event.module';
import { TaskModule } from '@task/task.module';

import { TelegrammController } from './controllers/telegramm.controller';

import { sessionMiddleware } from './middleware';

import {
  CatScene,
  DateScene,
  DogScene,
  HelpScene,
  NotificationScene,
  SightScene,
  TaskScene,
  TimeScene,
  WeatherScene,
} from './scenes';

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
