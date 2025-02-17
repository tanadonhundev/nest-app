import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global prefix
  app.setGlobalPrefix('api'); // locallhost:4000/api (ทุก route path)
  // api versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // enable auto validationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, //422 default is 400
    }),
  );
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
