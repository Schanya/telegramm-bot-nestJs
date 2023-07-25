import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { City } from './city.model';
import { CityService } from './city.service';

@Module({
  imports: [SequelizeModule.forFeature([City])],
  controllers: [],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
