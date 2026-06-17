import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { CreateVersionInput } from '../dto/create-version.input.js';
import { RecordFileScanInput } from '../dto/record-file-scan.input.js';
import { UpdateVersionDependenciesInput } from '../dto/update-version-dependencies.input.js';
import { UpdateVersionInput } from '../dto/update-version.input.js';
import { VersionsService } from '../services/versions.service.js';
import {
  VersionSearchResult,
  VersionSummary,
} from './version-summary.model.js';

@Resolver(() => VersionSummary)
export class VersionsResolver {
  constructor(private readonly versionsService: VersionsService) {}

  @Public()
  @Query(() => [VersionSummary])
  async versionsForProject(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
  ): Promise<VersionSummary[]> {
    return this.versionsService.findByProjectSlug(projectSlug);
  }

  @Public()
  @Query(() => VersionSearchResult)
  async versionSearchForProject(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @Args('gameVersion', { nullable: true, type: () => String })
    gameVersion?: string | null,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('loader', { nullable: true, type: () => String })
    loader?: string | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
  ): Promise<VersionSearchResult> {
    return this.versionsService.searchByProjectSlug(projectSlug, {
      gameVersion,
      limit: limit ?? undefined,
      loader,
      offset: offset ?? undefined,
      search,
    });
  }

  @Mutation(() => VersionSummary)
  createVersion(
    @Args('input') input: CreateVersionInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    return this.versionsService.createVersion(input, user.id);
  }

  @Mutation(() => VersionSummary)
  updateVersion(
    @Args('input') input: UpdateVersionInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    return this.versionsService.updateVersion(input, user.id);
  }

  @Mutation(() => VersionSummary)
  updateVersionDependencies(
    @Args('input') input: UpdateVersionDependenciesInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    return this.versionsService.updateVersionDependencies(input, user.id);
  }

  @Mutation(() => VersionSummary)
  recordFileScan(
    @Args('input') input: RecordFileScanInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    return this.versionsService.recordFileScan(input, user);
  }
}
