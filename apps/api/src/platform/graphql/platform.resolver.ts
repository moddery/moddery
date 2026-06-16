import { Query, Resolver } from '@nestjs/graphql';

import { PlatformService } from '../services/platform.service.js';
import { PlatformMetadata } from './platform-metadata.model.js';

@Resolver(() => PlatformMetadata)
export class PlatformResolver {
  constructor(private readonly platformService: PlatformService) {}

  @Query(() => PlatformMetadata)
  platformMetadata() {
    return this.platformService.metadata();
  }
}
