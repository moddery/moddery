import { ForbiddenException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { ReportsService } from '../services/reports.service.js';
import {
  CreateProjectModerationNoteInput,
  CreateUserModerationNoteInput,
} from './create-moderation-note.input.js';
import {
  CreateDirectThreadInput,
  CreateDirectThreadMessageInput,
} from './create-direct-thread-message.input.js';
import { CreateReportThreadMessageInput } from './create-report-thread-message.input.js';
import {
  CreateProjectReportInput,
  CreateUserReportInput,
  CreateVersionReportInput,
} from './create-report.input.js';
import { ModerationNoteSummary } from './moderation-note-summary.model.js';
import { ReportSummary } from './report-summary.model.js';
import { ThreadSummary } from './thread-summary.model.js';
import { UpdateReportStateInput } from './update-report-state.input.js';

@Resolver(() => ReportSummary)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => [ReportSummary])
  moderationReports(@CurrentUser() user: AuthenticatedUser) {
    assertCanModerate(user);
    return this.reportsService.findModerationReports();
  }

  @Query(() => ThreadSummary)
  reportThread(
    @Args('reportId') reportId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportsService.findReportThread(reportId);
  }

  @Query(() => [ThreadSummary])
  viewerDirectThreads(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.findViewerDirectThreads(user.id);
  }

  @Query(() => [ModerationNoteSummary])
  projectModerationNotes(
    @Args('projectSlug') projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportsService.findProjectModerationNotes(projectSlug);
  }

  @Query(() => [ModerationNoteSummary])
  userModerationNotes(
    @Args('username') username: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportsService.findUserModerationNotes(username);
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

  @Mutation(() => ThreadSummary)
  createReportThreadMessage(
    @Args('input') input: CreateReportThreadMessageInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportsService.createReportThreadMessage({
      authorId: user.id,
      body: input.body,
      reportId: input.reportId,
    });
  }

  @Mutation(() => ThreadSummary)
  createDirectThread(
    @Args('input') input: CreateDirectThreadInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.createDirectThread({
      authorId: user.id,
      body: input.body,
      username: input.username,
    });
  }

  @Mutation(() => ThreadSummary)
  createDirectThreadMessage(
    @Args('input') input: CreateDirectThreadMessageInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.createDirectThreadMessage({
      authorId: user.id,
      body: input.body,
      threadId: input.threadId,
    });
  }

  @Mutation(() => ModerationNoteSummary)
  createProjectModerationNote(
    @Args('input') input: CreateProjectModerationNoteInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportsService.createProjectModerationNote({
      authorId: user.id,
      body: input.body,
      projectSlug: input.projectSlug,
    });
  }

  @Mutation(() => ModerationNoteSummary)
  createUserModerationNote(
    @Args('input') input: CreateUserModerationNoteInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportsService.createUserModerationNote({
      authorId: user.id,
      body: input.body,
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
