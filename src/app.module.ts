import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from './telegramm/middleware/session.middleware';
import { TelegrammModule } from './telegramm/telegramm.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TELEGRAMM_BOT_TOKEN,
      middlewares: [sessionMiddleware],
      include: [TelegrammModule],
    }),
    TelegrammModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
