import { CreateCityDto } from '@city/dto/create-city.dto';
import { CreateUserDto } from './create-user.dto';
import { CreateEventDto } from '@event/dto/create-event.dto';

export class UserDataDto {
  userInfo?: CreateUserDto;
  cityInfo?: CreateCityDto;
  eventInfo?: CreateEventDto;
}
