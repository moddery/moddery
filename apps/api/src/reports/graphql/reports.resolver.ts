import { ForbiddenException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { ReportsService } from '../services/reports.service.js';
import {
  CreateProjectReportInput,
  CreateUserReportInput,
  CreateVersionReportInput,
} from './create-report.input.js';
import { ReportSummary } from './report-summary.model.js';
import { UpdateReportStateInput } from './update-report-state.input.js';

@Resolver(() => ReportSummary)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => [ReportSummary])
  moderationReports(@CurrentUser() user: AuthenticatedUser) {
    assertCanModerate(user);
    return this.reportsService.findModerationReports();
  }

  @Mutation(() => ReportSummary)
  updateReportState(
    @Args('input') input: UpdateReportStateInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportsService.updateReportState({
      id: input.id,
      state: input.state,
    });
  }

  @Mutation(() => ReportSummary)
  createProjectReport(
    @Args('input') input: CreateProjectReportInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.createProjectReport({
      body: input.body,
      projectSlug: input.projectSlug,
      reason: input.reason,
      reporterId: user.id,
    });
  }

  @Mutation(() => ReportSummary)
  createVersionReport(
    @Args('input') input: CreateVersionReportInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.createVersionReport({
      body: input.body,
      reason: input.reason,
      reporterId: user.id,
      versionId: input.versionId,
    });
  }

  @Mutation(() => ReportSummary)
  createUserReport(
    @Args('input') input: CreateUserReportInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.createUserReport({
      body: input.body,
      reason: input.reason,
      reporterId: user.id,
      username: input.username,
    });
  }
}

function assertCanModerate(user: AuthenticatedUser): void {
  if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
    return;
  }

  throw new ForbiddenException('Moderator access required');
}
