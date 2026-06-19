import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { SearchModule } from '../search/search.module.js';
import { VersionsResolver } from './graphql/versions.resolver.js';
import { VersionDependenciesService } from './services/version-dependencies.service.js';
import { VersionDirectoryService } from './services/version-directory.service.js';
import { VersionFileScansService } from './services/version-file-scans.service.js';
import { VersionsService } from './services/versions.service.js';

@Module({
  exports: [VersionDirectoryService, VersionFileScansService, VersionsService],
  imports: [
    AuditModule,
    NotificationsModule,
    PrismaModule,
    RedisModule,
    SearchModule,
  ],
  providers: [
    VersionDependenciesService,
    VersionDirectoryService,
    VersionFileScansService,
    VersionsResolver,
    VersionsService,
  ],
})
export class VersionsModule {}
