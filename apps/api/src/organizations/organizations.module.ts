import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { OrganizationsResolver } from './graphql/organizations.resolver.js';
import { OrganizationsService } from './services/organizations.service.js';

@Module({
  imports: [PrismaModule],
  providers: [OrganizationsResolver, OrganizationsService],
})
export class OrganizationsModule {}
