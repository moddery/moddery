import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { SearchModule } from '../search/search.module.js';
import { CatalogResolver } from './graphql/catalog.resolver.js';
import { CatalogService } from './services/catalog.service.js';

@Module({
  exports: [CatalogService],
  imports: [NotificationsModule, PrismaModule, RedisModule, SearchModule],
  providers: [CatalogResolver, CatalogService],
})
export class CatalogModule {}
