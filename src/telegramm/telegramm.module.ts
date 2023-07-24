import { Module, forwardRef } from '@nestjs/common';
import { TelegrammService } from './controllers/telegramm.controller';
import { AppModule } from 'src/app.module';
import { CatService } from './services/cat.service';
import { DogService } from './services/dog.service';
import { HelpService } from './services/help.service';
import { WeatherService } from './services/weather.service';

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [],
  providers: [
    TelegrammService,
    CatService,
    DogService,
    HelpService,
    WeatherService,
  ],
  exports: [
    TelegrammService,
    CatService,
    DogService,
    HelpService,
    WeatherService,
  ],
})
export class TelegrammModule {}
