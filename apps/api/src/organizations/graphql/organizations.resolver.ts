import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { AddOrganizationTeamMemberInput } from '../dto/add-organization-team-member.input.js';
import { AddProjectToOrganizationInput } from '../dto/add-project-to-organization.input.js';
import { CreateOrganizationInput } from '../dto/create-organization.input.js';
import { RemoveOrganizationTeamMemberInput } from '../dto/remove-organization-team-member.input.js';
import { RemoveProjectFromOrganizationInput } from '../dto/remove-project-from-organization.input.js';
import { UpdateOrganizationInput } from '../dto/update-organization.input.js';
import { OrganizationsService } from '../services/organizations.service.js';
import { OrganizationSummary } from './organization-summary.model.js';

@Resolver(() => OrganizationSummary)
export class OrganizationsResolver {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Public()
  @Query(() => [OrganizationSummary])
  publicOrganizations(
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
  ): Promise<OrganizationSummary[]> {
    return this.organizationsService.findPublicOrganizations({ search });
  }

  @Public()
  @Query(() => OrganizationSummary, { nullable: true })
  organizationBySlug(
    @Args('slug', { type: () => String }) slug: string,
  ): Promise<OrganizationSummary | null> {
    return this.organizationsService.findBySlug(slug);
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
    return this.organizationsService.addOrganizationTeamMember(input, user.id);
  }

  @Mutation(() => OrganizationSummary)
  addProjectToOrganization(
    @Args('input') input: AddProjectToOrganizationInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary> {
    return this.organizationsService.addProjectToOrganization(input, user.id);
  }

  @Mutation(() => OrganizationSummary)
  removeOrganizationTeamMember(
    @Args('input') input: RemoveOrganizationTeamMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary> {
    return this.organizationsService.removeOrganizationTeamMember(
      input,
      user.id,
    );
  }

  @Mutation(() => OrganizationSummary)
  removeProjectFromOrganization(
    @Args('input') input: RemoveProjectFromOrganizationInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummary> {
    return this.organizationsService.removeProjectFromOrganization(
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
    return this.organizationsService.updateOrganization(input, user.id);
  }
}
