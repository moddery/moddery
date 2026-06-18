import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import {
  PaginationArgs,
  paginationOptions,
} from '../../common/graphql/pagination.js';
import { AddOrganizationTeamMemberInput } from '../dto/add-organization-team-member.input.js';
import { AddProjectToOrganizationInput } from '../dto/add-project-to-organization.input.js';
import { CreateOrganizationInput } from '../dto/create-organization.input.js';
import { RemoveOrganizationTeamMemberInput } from '../dto/remove-organization-team-member.input.js';
import { RemoveProjectFromOrganizationInput } from '../dto/remove-project-from-organization.input.js';
import { UpdateOrganizationInput } from '../dto/update-organization.input.js';
import { OrganizationDirectoryService } from '../services/organization-directory.service.js';
import { OrganizationManagementService } from '../services/organization-management.service.js';
import { OrganizationsService } from '../services/organizations.service.js';
import {
  OrganizationMemberSearchResult,
  OrganizationProjectSearchResult,
  OrganizationSearchResult,
  OrganizationSummary,
} from './organization-summary.model.js';

@Resolver(() => OrganizationSummary)
export class OrganizationsResolver {
  constructor(
    private readonly organizationDirectoryService: OrganizationDirectoryService,
    private readonly organizationManagementService: OrganizationManagementService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Public()
  @Query(() => [OrganizationSummary])
  publicOrganizations(
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
  ): Promise<OrganizationSummary[]> {
    return this.organizationDirectoryService.findPublicOrganizationList({
      search,
    });
  }

  @Public()
  @Query(() => OrganizationSearchResult)
  publicOrganizationSearch(
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
    @Args() pagination?: PaginationArgs,
  ): Promise<OrganizationSearchResult> {
    return this.organizationDirectoryService.findPublicOrganizations({
      ...paginationOptions(pagination ?? {}),
      search,
    });
  }

  @Public()
  @Query(() => OrganizationSummary, { nullable: true })
  organizationBySlug(
    @Args('slug', { type: () => String }) slug: string,
  ): Promise<OrganizationSummary | null> {
    return this.organizationDirectoryService.findBySlug(slug);
  }

  @Public()
  @Query(() => OrganizationMemberSearchResult)
  organizationMemberSearch(
    @Args('slug', { type: () => String }) slug: string,
    @Args() pagination?: PaginationArgs,
  ): Promise<OrganizationMemberSearchResult> {
    return this.organizationDirectoryService.findOrganizationMembers(
      slug,
      paginationOptions(pagination ?? {}),
    );
  }

  @Public()
  @Query(() => OrganizationProjectSearchResult)
  organizationProjectSearch(
    @Args('slug', { type: () => String }) slug: string,
    @Args() pagination?: PaginationArgs,
  ): Promise<OrganizationProjectSearchResult> {
    return this.organizationDirectoryService.findOrganizationProjects(
      slug,
      paginationOptions(pagination ?? {}),
    );
  }

  @Mutation(() => OrganizationSummary)
  createOrganization(
    @Args('input') input: CreateOrganizationInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary> {
    return this.organizationsService.createOrganization(input, user.id);
  }

  @Mutation(() => OrganizationSummary)
  addOrganizationTeamMember(
    @Args('input') input: AddOrganizationTeamMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary> {
    return this.organizationManagementService.addOrganizationTeamMember(
      input,
      user.id,
    );
  }

  @Mutation(() => OrganizationSummary)
  addProjectToOrganization(
    @Args('input') input: AddProjectToOrganizationInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary> {
    return this.organizationManagementService.addProjectToOrganization(
      input,
      user.id,
    );
  }

  @Mutation(() => OrganizationSummary)
  removeOrganizationTeamMember(
    @Args('input') input: RemoveOrganizationTeamMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary> {
    return this.organizationManagementService.removeOrganizationTeamMember(
      input,
      user.id,
    );
  }

  @Mutation(() => OrganizationSummary)
  removeProjectFromOrganization(
    @Args('input') input: RemoveProjectFromOrganizationInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary> {
    return this.organizationManagementService.removeProjectFromOrganization(
      input,
      user.id,
    );
  }

  @Query(() => [OrganizationSummary])
  viewerOrganizations(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary[]> {
    return this.organizationsService.findViewerOrganizations(user.id);
  }

  @Mutation(() => OrganizationSummary)
  updateOrganization(
    @Args('input') input: UpdateOrganizationInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary> {
    return this.organizationManagementService.updateOrganization(
      input,
      user.id,
    );
  }
}
