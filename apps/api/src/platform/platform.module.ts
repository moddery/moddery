import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { PlatformResolver } from './graphql/platform.resolver.js';
import { PlatformService } from './services/platform.service.js';

@Module({
  exports: [PlatformService],
  imports: [PrismaModule],
  providers: [PlatformResolver, PlatformService],
})
export class PlatformModule {}
