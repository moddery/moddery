import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { paginationOptions } from '../../common/graphql/pagination.js';
import { ReportDirectThreadsService } from '../services/report-direct-threads.service.js';
import { ReportModerationNotesService } from '../services/report-moderation-notes.service.js';
import { ReportThreadsService } from '../services/report-threads.service.js';
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
import {
  ModerationNoteSearchResult,
  ModerationNoteSummary,
} from './moderation-note-summary.model.js';
import { ReportSearchResult, ReportSummary } from './report-summary.model.js';
import { ThreadSearchResult, ThreadSummary } from './thread-summary.model.js';
import { UpdateReportStateInput } from './update-report-state.input.js';

@Resolver(() => ReportSummary)
export class ReportsResolver {
  constructor(
    private readonly reportDirectThreadsService: ReportDirectThreadsService,
    private readonly reportModerationNotesService: ReportModerationNotesService,
    private readonly reportThreadsService: ReportThreadsService,
    private readonly reportsService: ReportsService,
  ) {}

  @Query(() => [ReportSummary])
  moderationReports(@CurrentUser() user: AuthenticatedUser) {
    assertCanModerate(user);
    return this.reportsService.findModerationReportList();
  }

  @Query(() => ReportSearchResult)
  moderationReportSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ) {
    assertCanModerate(user);
    return this.reportsService.findModerationReports(
      paginationOptions({ limit, offset }),
    );
  }

  @Query(() => ThreadSummary)
  reportThread(
    @Args('reportId') reportId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportThreadsService.findReportThread(reportId);
  }

  @Query(() => [ThreadSummary])
  viewerDirectThreads(@CurrentUser() user: AuthenticatedUser) {
    return this.reportDirectThreadsService.findViewerDirectThreadList(user.id);
  }

  @Query(() => ThreadSearchResult)
  viewerDirectThreadSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ) {
    return this.reportDirectThreadsService.findViewerDirectThreads(
      user.id,
      paginationOptions({ limit, offset }),
    );
  }

  @Query(() => [ModerationNoteSummary])
  projectModerationNotes(
    @Args('projectSlug') projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportModerationNotesService.findProjectModerationNoteList(
      projectSlug,
    );
  }

  @Query(() => ModerationNoteSearchResult)
  projectModerationNoteSearch(
    @Args('projectSlug') projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ) {
    assertCanModerate(user);
    return this.reportModerationNotesService.findProjectModerationNotes(
      projectSlug,
      paginationOptions({ limit, offset }),
    );
  }

  @Query(() => [ModerationNoteSummary])
  userModerationNotes(
    @Args('username') username: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.reportModerationNotesService.findUserModerationNoteList(
      username,
    );
  }

  @Query(() => ModerationNoteSearchResult)
  userModerationNoteSearch(
    @Args('username') username: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ) {
    assertCanModerate(user);
    return this.reportModerationNotesService.findUserModerationNotes(
      username,
      paginationOptions({ limit, offset }),
    );
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
    return this.reportThreadsService.createReportThreadMessage({
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
    return this.reportDirectThreadsService.createDirectThread({
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
    return this.reportDirectThreadsService.createDirectThreadMessage({
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
    return this.reportModerationNotesService.createProjectModerationNote({
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
    return this.reportModerationNotesService.createUserModerationNote({
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
