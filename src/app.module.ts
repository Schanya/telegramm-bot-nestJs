import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CoreModule } from './core/core.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/all-exeption.filter';

@Module({
  imports: [DatabaseModule, CoreModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [],
})
export class AppModule {}
