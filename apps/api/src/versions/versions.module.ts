import { Module } from '@nestjs/common';

import { VersionsResolver } from './graphql/versions.resolver.js';
import { VersionsService } from './services/versions.service.js';

@Module({
  exports: [VersionsService],
  providers: [VersionsResolver, VersionsService],
})
export class VersionsModule {}
