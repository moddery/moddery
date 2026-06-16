import { Module } from '@nestjs/common';

import { PlatformResolver } from './graphql/platform.resolver.js';
import { PlatformService } from './services/platform.service.js';

@Module({
  exports: [PlatformService],
  providers: [PlatformResolver, PlatformService],
})
export class PlatformModule {}
