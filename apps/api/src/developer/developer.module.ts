import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { DeveloperResolver } from './graphql/developer.resolver.js';
import { DeveloperService } from './services/developer.service.js';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [DeveloperResolver, DeveloperService],
})
export class DeveloperModule {}
