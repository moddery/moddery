import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TeamsResolver } from './graphql/teams.resolver.js';
import { TeamsService } from './services/teams.service.js';

@Module({
  imports: [AuditModule, PrismaModule],
  providers: [TeamsResolver, TeamsService],
})
export class TeamsModule {}
