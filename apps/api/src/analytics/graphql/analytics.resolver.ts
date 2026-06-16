import { Args, Query, Resolver } from '@nestjs/graphql';

import { Public } from '../../auth/decorators/public.decorator.js';
import { AnalyticsService } from '../analytics.service.js';
import { ProjectAnalyticsSummary } from './project-analytics.model.js';

@Resolver(() => ProjectAnalyticsSummary)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Query(() => ProjectAnalyticsSummary, { nullable: true })
  projectAnalytics(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
  ) {
    return this.analyticsService.projectAnalytics(projectSlug);
  }
}
