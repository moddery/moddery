import { Module } from '@nestjs/common';

import { AnalyticsModule } from '../analytics/analytics.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { SearchModule } from '../search/search.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

@Module({
  controllers: [HealthController],
  imports: [
    AnalyticsModule,
    PrismaModule,
    RedisModule,
    SearchModule,
    StorageModule,
  ],
  providers: [HealthService],
})
export class HealthModule {}
