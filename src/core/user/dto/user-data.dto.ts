import { CreateCityDto } from 'src/core/city/dto/create-city.dto';
import { CreateUserDto } from './create-user.dto';
import { CreateEventDto } from 'src/core/event/dto/create-event.dto';

export class UserDataDto {
  userInfo?: CreateUserDto;
  cityInfo?: CreateCityDto;
  eventInfo?: CreateEventDto;
}
