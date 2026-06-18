import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { SearchModule } from '../search/search.module.js';
import { CatalogResolver } from './graphql/catalog.resolver.js';
import { CatalogService } from './services/catalog.service.js';
import { ProjectFollowsService } from './services/project-follows.service.js';
import { ProjectGalleryService } from './services/project-gallery.service.js';
import { ProjectManagementService } from './services/project-management.service.js';
import { ProjectMembersService } from './services/project-members.service.js';
import { ProjectModerationLocksService } from './services/project-moderation-locks.service.js';
import { ProjectModerationService } from './services/project-moderation.service.js';

@Module({
  exports: [
    CatalogService,
    ProjectFollowsService,
    ProjectGalleryService,
    ProjectManagementService,
    ProjectMembersService,
    ProjectModerationLocksService,
    ProjectModerationService,
  ],
  imports: [
    AuditModule,
    NotificationsModule,
    PrismaModule,
    RedisModule,
    SearchModule,
  ],
  providers: [
    CatalogResolver,
    CatalogService,
    ProjectFollowsService,
    ProjectGalleryService,
    ProjectManagementService,
    ProjectMembersService,
    ProjectModerationLocksService,
    ProjectModerationService,
  ],
})
export class CatalogModule {}
