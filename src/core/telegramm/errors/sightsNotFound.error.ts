import { NotFoundException } from '@nestjs/common';

export class SightsNotFoundExeption extends NotFoundException {
  constructor(message: string) {
    super();
    this.message = message;
    this.name = this.constructor.name;
  }
}
