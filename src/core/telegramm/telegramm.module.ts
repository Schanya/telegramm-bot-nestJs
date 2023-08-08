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

@Module({
  imports: [UserModule, CityModule, EventModule, ScheduleModule.forRoot()],
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
  ],
})
export class TelegrammModule {}
