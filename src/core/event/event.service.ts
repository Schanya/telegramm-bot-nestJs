import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { CreateEventDto, EventOptions, ReadAllEventDto } from './dto';
import { Event } from './event.model';

@Injectable()
export class EventService {
  constructor(@InjectModel(Event) private eventRepository: typeof Event) {}

  public async findOne(options: EventOptions): Promise<Event> {
    const suitableEvent = await this.findBy({ ...options });

    if (!suitableEvent) {
      throw new BadRequestException("There isn't suitable event");
    }

    return suitableEvent;
  }

  public async findAll(options: ReadAllEventDto): Promise<Event[]> {
    const suitableCities = await this.eventRepository.findAll({
      where: { ...options },
    });

    return suitableCities;
  }

  public async findBy(options: EventOptions): Promise<Event> {
    const suitableEvent = await this.eventRepository.findOne({
      where: { ...options },
    });

    return suitableEvent;
  }

  public async create(createEventDto: CreateEventDto): Promise<Event> {
    const existingEvent = await this.findBy({
      time: createEventDto.time,
      type: createEventDto.type,
    });

    if (existingEvent) {
      throw new BadRequestException('Such event already exists');
    }

    const createdEvent = await this.eventRepository.create(createEventDto);

    return createdEvent;
  }

  public async delete(id: number): Promise<void> {
    const numberDeletedRows = await this.eventRepository.destroy({
      where: { id },
    });

    if (!numberDeletedRows)
      throw new BadRequestException('There is no suitable event');
  }
}
