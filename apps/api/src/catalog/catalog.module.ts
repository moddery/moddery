import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { SearchModule } from '../search/search.module.js';
import { CatalogResolver } from './graphql/catalog.resolver.js';
import { CatalogService } from './services/catalog.service.js';

@Module({
  exports: [CatalogService],
  imports: [PrismaModule, SearchModule],
  providers: [CatalogResolver, CatalogService],
})
export class CatalogModule {}
