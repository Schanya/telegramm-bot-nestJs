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
import { TimeHandler } from './buttons/time.button';

@Module({
  imports: [
    forwardRef(() => AppModule),
    UserModule,
    CityModule,
    EventModule,
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
    TimeHandler,
  ],
  exports: [
    TelegrammService,
    CatService,
    DogService,
    HelpService,
    WeatherService,
    NotificationService,
    TimeHandler,
  ],
})
export class TelegrammModule {}
