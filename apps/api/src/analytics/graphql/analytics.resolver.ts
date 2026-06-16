import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Public } from '../../auth/decorators/public.decorator.js';
import { AnalyticsService } from '../analytics.service.js';
import { DownloadRecord } from './download-record.model.js';
import { ProjectViewRecord } from './project-view-record.model.js';
import { ProjectAnalyticsSummary } from './project-analytics.model.js';
import { RecordDownloadInput } from './record-download.input.js';
import { RecordProjectViewInput } from './record-project-view.input.js';

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

  @Public()
  @Mutation(() => DownloadRecord)
  recordDownload(@Args('input') input: RecordDownloadInput) {
    return this.analyticsService.recordDownload(input.fileId);
  }

  @Public()
  @Mutation(() => ProjectViewRecord)
  recordProjectView(@Args('input') input: RecordProjectViewInput) {
    return this.analyticsService.recordProjectView(input.projectSlug);
  }
}
