import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OrganizationsResolver } from './graphql/organizations.resolver.js';
import { OrganizationsService } from './services/organizations.service.js';

@Module({
  imports: [NotificationsModule, PrismaModule],
  providers: [OrganizationsResolver, OrganizationsService],
})
export class OrganizationsModule {}
