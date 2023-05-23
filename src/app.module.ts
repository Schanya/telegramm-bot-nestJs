import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
