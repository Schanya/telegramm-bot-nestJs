import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [DatabaseModule, CoreModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
