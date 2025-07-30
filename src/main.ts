import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { KafkaErrorInterceptor } from './interceptors';
import { DEFAULT_APP_PORT } from './constants/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new KafkaErrorInterceptor());
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? DEFAULT_APP_PORT);
}
bootstrap();
