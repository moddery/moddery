import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { CollectionsResolver } from './graphql/collections.resolver.js';
import { CollectionsService } from './services/collections.service.js';
import { PublicCollectionsService } from './services/public-collections.service.js';

@Module({
  imports: [PrismaModule],
  providers: [
    CollectionsResolver,
    CollectionsService,
    PublicCollectionsService,
  ],
})
export class CollectionsModule {}
