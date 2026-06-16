import { Args, Query, Resolver } from '@nestjs/graphql';

import { VersionsService } from '../services/versions.service.js';
import { VersionSummary } from './version-summary.model.js';

@Resolver(() => VersionSummary)
export class VersionsResolver {
  constructor(private readonly versionsService: VersionsService) {}

  @Query(() => [VersionSummary])
  versionsForProject(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
  ): VersionSummary[] {
    return this.versionsService.findByProjectSlug(projectSlug);
  }
}
