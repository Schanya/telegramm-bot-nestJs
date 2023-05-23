import { Module, forwardRef } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from './middleware/session.middleware';
import { TelegrammService } from './telegramm.service';
import { AppModule } from 'src/app.module';

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [],
  providers: [TelegrammService],
  exports: [TelegrammService],
})
export class TelegrammModule {}
