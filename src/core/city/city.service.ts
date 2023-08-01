import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { City } from './city.model';
import { CityOptions } from './dto/find-city.options';
import { ReadAllCityDto } from './dto/read-all-city.dto';
import { CreateCityDto } from './dto/create-city.dto';

@Injectable()
export class CityService {
  constructor(@InjectModel(City) private cityRepository: typeof City) {}

  public async findOne(options: CityOptions): Promise<City> {
    const suitableCity = await this.findBy({ ...options });

    if (!suitableCity) {
      throw new BadRequestException("There isn't suitable city");
    }

    return suitableCity;
  }

  public async findAll(options: ReadAllCityDto): Promise<City[]> {
    const suitableCities = await this.cityRepository.findAll({
      where: { ...options },
    });

    return suitableCities;
  }

  public async findBy(options: CityOptions): Promise<City> {
    const suitableCity = await this.cityRepository.findOne({
      where: { ...options },
    });

    return suitableCity;
  }

  public async create(createCityDto: CreateCityDto): Promise<City> {
    const existingCity = await this.findBy({
      name: createCityDto.name,
    });

    if (existingCity) {
      throw new BadRequestException('Such city already exists');
    }

    const createdCity = await this.cityRepository.create(createCityDto);

    return createdCity;
  }

  public async delete(id: number): Promise<void> {
    const numberDeletedRows = await this.cityRepository.destroy({
      where: { id },
    });

    if (!numberDeletedRows)
      throw new BadRequestException('There is no suitable city');
  }
}
