import { ForbiddenException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { UpsertCategoryInput } from '../dto/upsert-category.input.js';
import { UpsertGameVersionInput } from '../dto/upsert-game-version.input.js';
import { UpsertLicenseInput } from '../dto/upsert-license.input.js';
import { PlatformService } from '../services/platform.service.js';
import { CategorySummary } from './category.model.js';
import { GameVersionSummary } from './game-version.model.js';
import { LicenseSummary } from './license.model.js';
import { PlatformMetadata } from './platform-metadata.model.js';

@Resolver(() => PlatformMetadata)
export class PlatformResolver {
  constructor(private readonly platformService: PlatformService) {}

  @Public()
  @Query(() => PlatformMetadata)
  platformMetadata() {
    return this.platformService.metadata();
  }

  @Public()
  @Query(() => [CategorySummary])
  categories() {
    return this.platformService.findCategories();
  }

  @Public()
  @Query(() => [GameVersionSummary])
  gameVersions() {
    return this.platformService.findGameVersions();
  }

  @Public()
  @Query(() => [LicenseSummary])
  licenses() {
    return this.platformService.findLicenses();
  }

  @Mutation(() => CategorySummary)
  upsertCategory(
    @Args('input') input: UpsertCategoryInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertAdmin(user);
    return this.platformService.upsertCategory(input);
  }

  @Mutation(() => GameVersionSummary)
  upsertGameVersion(
    @Args('input') input: UpsertGameVersionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertAdmin(user);
    return this.platformService.upsertGameVersion(input);
  }

  @Mutation(() => LicenseSummary)
  upsertLicense(
    @Args('input') input: UpsertLicenseInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertAdmin(user);
    return this.platformService.upsertLicense(input);
  }
}

function assertAdmin(user: AuthenticatedUser): void {
  if (user.role === 'ADMIN') {
    return;
  }

  throw new ForbiddenException('Admin access required');
}
