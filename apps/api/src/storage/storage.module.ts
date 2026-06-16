import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { S3_CLIENT } from './storage.constants.js';

@Module({
  exports: [S3_CLIENT],
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
  ],
})
export class StorageModule {}
