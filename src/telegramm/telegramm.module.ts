import { Module, forwardRef } from '@nestjs/common';
import { TelegrammService } from './controllers/telegramm.controller';
import { AppModule } from 'src/app.module';
import { CatService } from './services/cat.service';
import { DogService } from './services/dog.service';
import { HelpService } from './services/help.service';
import { WeatherService } from './services/weather.service';
import { CoreModule } from 'src/core/core.module';
import { UserModule } from 'src/core/user/user.module';
import { CityModule } from 'src/core/city/city.module';

@Module({
  imports: [forwardRef(() => AppModule), UserModule, CityModule],
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
