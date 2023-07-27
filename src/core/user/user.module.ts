import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from './user.model';
import { UserService } from './user.service';
import { CityModule } from '../city/city.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), CityModule, EventModule],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
