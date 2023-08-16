import { NotFoundException } from '@nestjs/common';

export class ActionNotFoundExeption extends NotFoundException {
  constructor(message: string) {
    super();
    this.message = message;
    this.name = this.constructor.name;
  }
}
