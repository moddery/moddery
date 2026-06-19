import { type Request } from 'express';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Public } from '../../auth/decorators/public.decorator.js';
import { AnalyticsService } from '../analytics.service.js';
import { analyticsRequestMetadata } from '../request-metadata.js';
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
  recordDownload(
    @Args('input') input: RecordDownloadInput,
    @Context('req') request: Request | undefined,
  ) {
    return this.analyticsService.recordDownload(
      input.fileId,
      analyticsRequestMetadata(request),
    );
  }

  @Public()
  @Mutation(() => ProjectViewRecord)
  recordProjectView(
    @Args('input') input: RecordProjectViewInput,
    @Context('req') request: Request | undefined,
  ) {
    return this.analyticsService.recordProjectView(
      input.projectSlug,
      analyticsRequestMetadata(request),
    );
  }
}
