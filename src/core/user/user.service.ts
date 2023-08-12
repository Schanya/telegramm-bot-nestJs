import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserOptions } from './dto/find-user.options';
import { ReadAllUserDto } from './dto/read-all-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDataDto } from './dto/user-data.dto';
import { CityService } from '../city/city.service';
import { EventService } from '../event/event.service';
import { formatTime } from '../telegramm/services/utils/time-methods';

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

    let res = await existingCity.$add('user', existingUser);
    let temp = await event.$add('user', existingUser);
    return {
      user: existingUser,
      city: existingCity,
      event,
    };
  }

  public async checkUserEvents(userID: number, eventType: EventType) {
    const user = await this.findBy({ telegrammID: userID });

    if (user) {
      const userEvents = await user.$get('events', { type: eventType });
      if (userEvents.length == 1) {
        const userCity = await user.$get('city');
        throw new BadRequestException(
          `Вы уже подписаны на рассылку:\n Город: ${
            userCity.name
          } \n Время: ${formatTime({
            hours: userEvents[0].time.getHours(),
            minutes: userEvents[0].time.getMinutes(),
          })}`,
        );
      }
    }
  }
}
