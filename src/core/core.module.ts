import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CityModule } from './city/city.module';
import { TelegrammModule } from './telegramm/telegramm.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from './telegramm/middleware/session.middleware';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TELEGRAMM_BOT_TOKEN,
      middlewares: [sessionMiddleware],
      include: [TelegrammModule],
    }),
    UserModule,
    CityModule,
    TelegrammModule,
    EventModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreModule {}
