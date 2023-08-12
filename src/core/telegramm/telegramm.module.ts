import { Module, forwardRef } from '@nestjs/common';
import { TelegrammService } from './controllers/telegramm.controller';
import { AppModule } from 'src/app.module';
import { CatService } from './services/cat.service';
import { DogService } from './services/dog.service';
import { HelpService } from './services/help.service';
import { WeatherService } from './services/weather.service';
import { UserModule } from 'src/core/user/user.module';
import { CityModule } from 'src/core/city/city.module';
import { EventModule } from '../event/event.module';
import { NotificationService } from './services/schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TimeService } from './services/time.service';
import { SightService } from './services/sight.service';
import { TaskModule } from '../task/task.module';
import { TaskService } from './services/task.service';
import { DateService } from './services/date.service';

@Module({
  imports: [
    UserModule,
    CityModule,
    EventModule,
    TaskModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    TelegrammService,
    CatService,
    DogService,
    HelpService,
    WeatherService,
    NotificationService,
    TimeService,
    SightService,
    TaskService,
    DateService,
  ],
  exports: [
    TelegrammService,
    CatService,
    DogService,
    HelpService,
    WeatherService,
    NotificationService,
    TimeService,
    SightService,
    TaskService,
    DateService,
  ],
})
export class TelegrammModule {}
