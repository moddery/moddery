import { Args, Query, Resolver } from '@nestjs/graphql';

import { Public } from '../../auth/decorators/public.decorator.js';
import { OrganizationsService } from '../services/organizations.service.js';
import { OrganizationSummary } from './organization-summary.model.js';

@Resolver(() => OrganizationSummary)
export class OrganizationsResolver {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Public()
  @Query(() => [OrganizationSummary])
  publicOrganizations(): Promise<OrganizationSummary[]> {
    return this.organizationsService.findPublicOrganizations();
  }

  @Public()
  @Query(() => OrganizationSummary, { nullable: true })
  organizationBySlug(
    @Args('slug', { type: () => String }) slug: string,
  ): Promise<OrganizationSummary | null> {
    return this.organizationsService.findBySlug(slug);
  }
}
