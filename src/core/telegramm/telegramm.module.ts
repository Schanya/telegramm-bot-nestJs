import { Module, forwardRef } from '@nestjs/common';
import { TelegrammController } from './controllers/telegramm.controller';
import { AppModule } from 'src/app.module';
import { CatScene } from './scenes/cat/cat.scene';
import { DogScene } from './scenes/dog/dog.scene';
import { HelpScene } from './scenes/help/help.scene';
import { WeatherScene } from './scenes/weather/weather.scene';
import { UserModule } from 'src/core/user/user.module';
import { CityModule } from 'src/core/city/city.module';
import { EventModule } from '../event/event.module';
import { NotificationScene } from './scenes/notification/notification.scene';
import { ScheduleModule } from '@nestjs/schedule';
import { TimeScene } from './scenes/time/time.scene';
import { SightScene } from './scenes/sight/sight.scene';
import { TaskModule } from '../task/task.module';
import { TaskScene } from './scenes/task/task.scene';
import { DateScene } from './scenes/date/date.scene';

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
    TelegrammController,
    CatScene,
    DogScene,
    HelpScene,
    WeatherScene,
    NotificationScene,
    TimeScene,
    SightScene,
    TaskScene,
    DateScene,
  ],
  exports: [
    TelegrammController,
    CatScene,
    DogScene,
    HelpScene,
    WeatherScene,
    NotificationScene,
    TimeScene,
    SightScene,
    TaskScene,
    DateScene,
  ],
})
export class TelegrammModule {}
