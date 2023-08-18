import { EventType } from '../types';

export class CreateEventDto {
  time: Date;
  type: EventType;
}
