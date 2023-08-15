import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { CityModule } from './city/city.module';
import { EventModule } from './event/event.module';
import { sessionMiddleware } from './telegramm/middleware/session.middleware';
import { TelegrammModule } from './telegramm/telegramm.module';
import { UserModule } from './user/user.module';
import { telegramm } from 'env';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: telegramm.token,
      middlewares: [sessionMiddleware],
      include: [TelegrammModule],
    }),
    UserModule,
    CityModule,
    TelegrammModule,
    EventModule,
    TaskModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreModule {}
