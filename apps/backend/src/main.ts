import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ENodeEnv } from '@zaparthotels/types';
import { mockServer } from './mocks/mockServer';

if (process.env.NODE_ENV !== ENodeEnv.PRODUCTION) {
  mockServer.listen({
    onUnhandledRequest: 'warn',
  });

  console.warn('[WARN] Mock server is running');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors();

  const port = Number.parseInt(process.env.PORT, 10) || 3001;
  await app.listen(port);
}
bootstrap();
