import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { CityService } from '@city/city.service';
import { EventService } from '@event/event.service';

import { CreateUserDto, ReadAllUserDto, UserDataDto, UserOptions } from './dto';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private readonly cityService: CityService,
    private readonly eventService: EventService,
  ) {}

  public async findOne(options: UserOptions): Promise<User> {
    const suitableUser = await this.findBy({ ...options });

    if (!suitableUser) {
      throw new BadRequestException("There isn't suitable user");
    }

    return suitableUser;
  }

  public async findAll(options: ReadAllUserDto): Promise<User[]> {
    const suitableUsers = await this.userRepository.findAll({
      where: { ...options },
    });

    return suitableUsers;
  }

  public async findBy(options: UserOptions): Promise<User> {
    const suitableUser = await this.userRepository.findOne({
      where: { ...options },
    });

    return suitableUser;
  }

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findBy({
      telegrammID: createUserDto.telegrammID,
    });

    if (user) {
      throw new BadRequestException('Such user already exists');
    }

    const createdUser = await this.userRepository.create(createUserDto);

    return createdUser;
  }

  public async delete(id: number): Promise<void> {
    const numberDeletedRows = await this.userRepository.destroy({
      where: { id },
    });

    if (!numberDeletedRows)
      throw new BadRequestException('There is no suitable user');
  }

  public async saveUserWithData(userData: UserDataDto) {
    const { cityInfo, userInfo, eventInfo } = userData;

    let existingCity = await this.cityService.findBy({
      name: cityInfo.name,
    });
    if (!existingCity) {
      existingCity = await this.cityService.create({ name: cityInfo.name });
    }

    let existingUser = await this.findBy({
      telegrammID: userInfo.telegrammID,
    });

    if (!existingUser) {
      existingUser = await this.create({
        name: userInfo.name,
        telegrammID: userInfo.telegrammID,
      });
    }

    let event = await this.eventService.create({
      time: eventInfo.time,
      type: eventInfo.type,
    });

    await existingCity.$add('user', existingUser);
    await event.$add('user', existingUser);

    return {
      user: existingUser,
      city: existingCity,
      event,
    };
  }
}
