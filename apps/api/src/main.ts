import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const corsOrigins = config.getOrThrow<string[]>('app.corsOrigins');
  const port = config.getOrThrow<number>('app.port');
  const trustProxyHops = config.getOrThrow<number>('app.trustProxyHops');

  if (trustProxyHops > 0) {
    app.set('trust proxy', trustProxyHops);
  }

  if (config.getOrThrow<boolean>('app.securityHeadersEnabled')) {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(port);
  Logger.log(`API listening on http://localhost:${String(port)}`, 'Bootstrap');
}

void bootstrap();
