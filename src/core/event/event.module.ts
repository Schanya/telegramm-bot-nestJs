import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './event.model';
import { EventService } from './event.service';

@Module({
  imports: [SequelizeModule.forFeature([Event])],
  controllers: [],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
