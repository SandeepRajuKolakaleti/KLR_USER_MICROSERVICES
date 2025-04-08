import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
require('dotenv').config();
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  require('newrelic');
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const LISTEN_PORT = 3000;
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  const options = new DocumentBuilder()
    .setTitle('User micro services')
    .setDescription('The User services description')
    .setVersion('1.0')
    .addTag('UserServices')
    .addBearerAuth()
    .build();
    console.log(options);
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1', app, document);
  // SwaggerModule.setup('api/v1', app, createDocument(app));
  await app.listen(process.env.PORT || LISTEN_PORT);
}
bootstrap();
