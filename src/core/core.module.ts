import { Module } from '@nestjs/common';

import { CityModule } from '@city/city.module';
import { EventModule } from '@event/event.module';
import { TaskModule } from '@task/task.module';
import { TelegrammModule } from './telegramm/telegramm.module';
import { UserModule } from '@user/user.module';

@Module({
  imports: [UserModule, CityModule, TelegrammModule, EventModule, TaskModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreModule {}
