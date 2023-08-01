import { Module } from '@nestjs/common/decorators';
import { SequelizeModule } from '@nestjs/sequelize';

import { dbconfig } from '../config/sequelize-module-options.config';

@Module({
  imports: [SequelizeModule.forRoot(dbconfig)],
})
export class DatabaseModule {}
