import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserOptions } from './dto/find-user.options';
import { ReadAllUserDto } from './dto/read-all-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

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
    const existingUser = await this.findBy({
      telegrammID: createUserDto.telegrammID,
    });

    if (existingUser) {
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
}
