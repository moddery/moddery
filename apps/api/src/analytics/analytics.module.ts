import { createClient, type ClickHouseClient } from '@clickhouse/client';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CLICKHOUSE_CLIENT } from './analytics.constants.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
  exports: [AnalyticsService],
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
    AnalyticsService,
  ],
})
export class AnalyticsModule {}
