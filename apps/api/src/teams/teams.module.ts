import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { TeamsResolver } from './graphql/teams.resolver.js';
import { TeamsService } from './services/teams.service.js';

@Module({
  imports: [PrismaModule],
  providers: [TeamsResolver, TeamsService],
})
export class TeamsModule {}
