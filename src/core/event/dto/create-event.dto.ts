import { EventType } from '../types/event.type';

export class CreateEventDto {
  time: Date;
  type: EventType;
}
