import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { VersionsResolver } from './graphql/versions.resolver.js';
import { VersionsService } from './services/versions.service.js';

@Module({
  exports: [VersionsService],
  imports: [PrismaModule],
  providers: [VersionsResolver, VersionsService],
})
export class VersionsModule {}
