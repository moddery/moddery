import { Module } from '@nestjs/common';

import { CatalogResolver } from './graphql/catalog.resolver.js';
import { CatalogService } from './services/catalog.service.js';

@Module({
  exports: [CatalogService],
  providers: [CatalogResolver, CatalogService],
})
export class CatalogModule {}
