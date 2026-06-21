import { ForbiddenException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { RequireCredentialScopes } from '../../auth/decorators/credential-scopes.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import {
  PaginationArgs,
  paginationOptions,
} from '../../common/graphql/pagination.js';
import { CreateVersionInput } from '../dto/create-version.input.js';
import { ModerateVersionInput } from '../dto/moderate-version.input.js';
import { RecordFileScanInput } from '../dto/record-file-scan.input.js';
import { UpdateVersionDependenciesInput } from '../dto/update-version-dependencies.input.js';
import { UpdateVersionInput } from '../dto/update-version.input.js';
import { VersionDirectoryService } from '../services/version-directory.service.js';
import { VersionFileScansService } from '../services/version-file-scans.service.js';
import { VersionsService } from '../services/versions.service.js';
import {
  VersionSearchResult,
  VersionSummary,
} from './version-summary.model.js';

@Resolver(() => VersionSummary)
export class VersionsResolver {
  constructor(
    private readonly versionDirectoryService: VersionDirectoryService,
    private readonly versionFileScansService: VersionFileScansService,
    private readonly versionsService: VersionsService,
  ) {}

  @Public()
  @Query(() => [VersionSummary])
  async versionsForProject(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
  ): Promise<VersionSummary[]> {
    return this.versionDirectoryService.findByProjectSlug(projectSlug);
  }

  @Public()
  @Query(() => VersionSearchResult)
  async versionSearchForProject(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @Args('gameVersion', { nullable: true, type: () => String })
    gameVersion?: string | null,
    @Args('loader', { nullable: true, type: () => String })
    loader?: string | null,
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
    @Args() pagination?: PaginationArgs,
  ): Promise<VersionSearchResult> {
    return this.versionDirectoryService.searchByProjectSlug(projectSlug, {
      gameVersion,
      loader,
      ...paginationOptions(pagination ?? {}),
      search,
    });
  }

  @RequireCredentialScopes('read:projects')
  @Query(() => VersionSearchResult)
  async viewerProjectVersionSearch(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args() pagination?: PaginationArgs,
  ): Promise<VersionSearchResult> {
    return this.versionsService.findManagedProjectVersionSearch(
      projectSlug,
      user.id,
      paginationOptions(pagination ?? {}),
    );
  }

  @Query(() => VersionSearchResult)
  async moderationVersionSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args() pagination?: PaginationArgs,
  ): Promise<VersionSearchResult> {
    assertCanModerate(user);
    return this.versionsService.findVersionsForModeration(
      paginationOptions(pagination ?? {}),
    );
  }

  @RequireCredentialScopes('write:projects')
  @Mutation(() => VersionSummary)
  createVersion(
    @Args('input') input: CreateVersionInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    return this.versionsService.createVersion(input, user.id);
  }

  @RequireCredentialScopes('write:projects')
  @Mutation(() => VersionSummary)
  updateVersion(
    @Args('input') input: UpdateVersionInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    return this.versionsService.updateVersion(input, user.id);
  }

  @RequireCredentialScopes('write:projects')
  @Mutation(() => VersionSummary)
  updateVersionDependencies(
    @Args('input') input: UpdateVersionDependenciesInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    return this.versionsService.updateVersionDependencies(input, user.id);
  }

  @RequireCredentialScopes('write:projects')
  @Mutation(() => Boolean)
  deleteVersion(
    @Args('versionId', { type: () => String }) versionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return this.versionsService.deleteVersion(versionId, user.id);
  }

  @Mutation(() => VersionSummary)
  recordFileScan(
    @Args('input') input: RecordFileScanInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    return this.versionFileScansService.recordFileScan(input, user);
  }

  @Mutation(() => VersionSummary)
  scanVersionFile(
    @Args('fileId', { type: () => String }) fileId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    return this.versionFileScansService.scanVersionFile(fileId, user);
  }

  @Mutation(() => VersionSummary)
  moderateVersion(
    @Args('input') input: ModerateVersionInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VersionSummary> {
    assertCanModerate(user);
    return this.versionsService.moderateVersion(input, user.id);
  }
}

function assertCanModerate(user: AuthenticatedUser): void {
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new ForbiddenException('Moderator access required');
  }
}
