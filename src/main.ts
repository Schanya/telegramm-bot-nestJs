import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { application } from 'env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(application.port));
}
bootstrap();
