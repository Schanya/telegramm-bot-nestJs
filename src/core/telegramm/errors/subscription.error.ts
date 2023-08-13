import { BadRequestException } from '@nestjs/common';

export class SubscriptionExeption extends BadRequestException {
  constructor(message: string) {
    super();
    this.message = message;
    this.name = this.constructor.name;
  }
}
