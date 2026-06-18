import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OrganizationsResolver } from './graphql/organizations.resolver.js';
import { OrganizationDirectoryService } from './services/organization-directory.service.js';
import { OrganizationManagementService } from './services/organization-management.service.js';
import { OrganizationsService } from './services/organizations.service.js';

@Module({
  imports: [AuditModule, NotificationsModule, PrismaModule],
  providers: [
    OrganizationDirectoryService,
    OrganizationManagementService,
    OrganizationsResolver,
    OrganizationsService,
  ],
})
export class OrganizationsModule {}
