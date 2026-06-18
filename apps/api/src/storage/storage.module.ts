import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module.js';
import { StorageResolver } from './graphql/storage.resolver.js';
import { StorageService } from './storage.service.js';
import { S3_CLIENT } from './storage.constants.js';

@Module({
  exports: [S3_CLIENT, StorageService],
  imports: [PrismaModule],
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): S3Client =>
        new S3Client({
          credentials: {
            accessKeyId: config.getOrThrow<string>('s3.accessKeyId'),
            secretAccessKey: config.getOrThrow<string>('s3.secretAccessKey'),
          },
          endpoint: config.get<string>('s3.endpoint'),
          forcePathStyle: config.getOrThrow<boolean>('s3.forcePathStyle'),
          region: config.getOrThrow<string>('s3.region'),
        }),
    },
    StorageResolver,
    StorageService,
  ],
})
export class StorageModule {}
