import { BadRequestException } from '@nestjs/common';

export class UnsubscribeExeption extends BadRequestException {
  constructor(message: string) {
    super();
    this.message = message;
    this.name = this.constructor.name;
  }
}
