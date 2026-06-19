import { createClient, type ClickHouseClient } from '@clickhouse/client';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CLICKHOUSE_CLIENT } from './analytics.constants.js';
import { AnalyticsService } from './analytics.service.js';
import { DownloadsController } from './downloads.controller.js';
import { AnalyticsResolver } from './graphql/analytics.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { SearchModule } from '../search/search.module.js';

@Module({
  controllers: [DownloadsController],
  exports: [AnalyticsService],
  imports: [PrismaModule, RedisModule, SearchModule],
  providers: [
    {
      provide: CLICKHOUSE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): ClickHouseClient =>
        createClient({
          database: config.getOrThrow<string>('analytics.database'),
          password: config.get<string>('analytics.password'),
          url: config.getOrThrow<string>('analytics.url'),
          username: config.getOrThrow<string>('analytics.username'),
        }),
    },
    AnalyticsResolver,
    AnalyticsService,
  ],
})
export class AnalyticsModule {}
