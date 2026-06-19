import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type ProjectSummaryContract } from '@moddery/shared';
import {
  ModerationActionKind,
  ProjectStatus,
  type Prisma,
} from '@prisma/client';

import { AuditService } from '../../audit/audit.service.js';
import { NotificationsService } from '../../notifications/services/notifications.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RedisService } from '../../redis/redis.service.js';
import { SearchService } from '../../search/search.service.js';
import { type ModerateProjectInput } from '../dto/moderate-project.input.js';
import {
  projectBySlugCacheKey,
  projectContractToSearch,
  projectRowToContract,
  projectSelect,
  type ProjectRow,
  type ProjectSearchResultContract,
} from './project-read-model.js';

export interface ModerationActionContract {
  createdAt: Date;
  id: string;
  kind: string;
  moderator: {
    displayName: string | null;
    id: string;
    username: string;
  };
  projectId: string;
  reason: string | null;
}

interface ModerationActionRow {
  createdAt: Date;
  id: string;
  kind: string;
  moderator: {
    displayName: string | null;
    id: string;
    username: string;
  };
  projectId: string | null;
  reason: string | null;
}

export interface ModerationActionSearchResultContract {
  actions: ModerationActionContract[];
  totalHits: number;
}

@Injectable()
export class ProjectModerationService {
  constructor(
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
    private readonly redis: RedisService,
  ) {}

  async findProjectsForModeration({
    limit = 50,
    offset = 0,
  }: {
    limit?: number;
    offset?: number;
  } = {}): Promise<ProjectSearchResultContract> {
    const where = {
      status: {
        in: [
          ProjectStatus.PENDING_REVIEW,
          ProjectStatus.REJECTED,
          ProjectStatus.ARCHIVED,
        ],
      },
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, projects]: [number, ProjectRow[]] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        orderBy: [{ queuedAt: 'asc' }, { createdAt: 'asc' }],
        select: projectSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      projects: projects.map(projectRowToContract),
      totalHits,
    };
  }

  async findProjectModerationList(): Promise<ProjectSummaryContract[]> {
    const result = await this.findProjectsForModeration();

    return result.projects;
  }

  async findProjectModerationActions(
    projectSlug: string,
    { limit = 25, offset = 0 }: { limit?: number; offset?: number } = {},
  ): Promise<ModerationActionSearchResultContract> {
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    const where = { projectId: project.id };
    const [totalHits, actions] = await Promise.all([
      this.prisma.moderationAction.count({ where }),
      this.prisma.moderationAction.findMany({
        orderBy: { createdAt: 'desc' },
        select: moderationActionSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      actions: actions.map((action) =>
        moderationActionToContract(action, project.id),
      ),
      totalHits,
    };
  }

  async findProjectModerationActionList(
    projectSlug: string,
  ): Promise<ModerationActionContract[]> {
    const result = await this.findProjectModerationActions(projectSlug);

    return result.actions;
  }

  async moderateProject(
    input: ModerateProjectInput,
    moderatorId: string,
  ): Promise<ProjectSummaryContract> {
    const action = moderationAction(input.action);
    const project = await this.prisma.project.findUnique({
      select: moderationProjectAuditSelect(),
      where: { slug: input.projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.project.update({
        data: moderationProjectData(action, now),
        where: { id: project.id },
      });
      await tx.moderationAction.create({
        data: {
          kind: action,
          moderatorId,
          projectId: project.id,
          reason: nullableTrim(input.reason),
        },
      });

      return tx.project.findUniqueOrThrow({
        select: projectSelect(),
        where: { id: project.id },
      });
    });

    await this.auditService.recordProjectModeration({
      action,
      actorId: moderatorId,
      after: {
        id: updated.id,
        projectKind: updated.kind,
        requestedStatus: updated.requestedStatus,
        slug: updated.slug,
        status: updated.status,
        title: updated.title,
      },
      before: {
        id: project.id,
        projectKind: project.kind,
        requestedStatus: project.requestedStatus,
        slug: project.slug,
        status: project.status,
        title: project.title,
      },
      reason: nullableTrim(input.reason),
    });

    const contract = projectRowToContract(updated);
    if (contract.status === 'APPROVED') {
      await this.searchService.indexProjects([
        projectContractToSearch(contract),
      ]);
    } else {
      await this.searchService.deleteProject(contract.id);
    }
    await this.invalidateProjectBySlugCache(contract.slug);
    await this.notifyProjectReviewDecision({
      action,
      project,
      reason: nullableTrim(input.reason),
    });

    return contract;
  }

  private invalidateProjectBySlugCache(slug: string): Promise<void> {
    return this.redis.delete(projectBySlugCacheKey(slug));
  }

  private async notifyProjectReviewDecision({
    action,
    project,
    reason,
  }: {
    action: ModerationActionKind;
    project: ProjectModerationAuditRow;
    reason: string | null;
  }): Promise<void> {
    const recipients = [
      ...new Set(project.team.members.map((member) => member.userId)),
    ];

    await Promise.all(
      recipients.map((userId) =>
        this.notificationsService.sendUserNotification({
          actionUrl: '/dashboard#dashboard-projects',
          body: projectReviewNotificationBody(project.title, action, reason),
          title: projectReviewNotificationTitle(action),
          type: 'moderation',
          userId,
        }),
      ),
    );
  }
}

function moderationProjectAuditSelect() {
  return {
    id: true,
    kind: true,
    requestedStatus: true,
    slug: true,
    status: true,
    team: {
      select: {
        members: {
          select: { userId: true },
          where: { acceptedAt: { not: null } },
        },
      },
    },
    title: true,
  };
}

type ProjectModerationAuditRow = Prisma.ProjectGetPayload<{
  select: ReturnType<typeof moderationProjectAuditSelect>;
}>;

function moderationAction(action: string): ModerationActionKind {
  const normalized = action.trim().toUpperCase();
  if (normalized === ModerationActionKind.APPROVE) {
    return ModerationActionKind.APPROVE;
  }
  if (normalized === ModerationActionKind.REJECT) {
    return ModerationActionKind.REJECT;
  }
  if (normalized === ModerationActionKind.ARCHIVE) {
    return ModerationActionKind.ARCHIVE;
  }
  if (normalized === ModerationActionKind.RESTORE) {
    return ModerationActionKind.RESTORE;
  }

  throw new ForbiddenException('Unsupported moderation action');
}

function moderationProjectData(
  action: ModerationActionKind,
  now: Date,
): Prisma.ProjectUpdateInput {
  if (action === ModerationActionKind.APPROVE) {
    return {
      approvedAt: now,
      publishedAt: now,
      requestedStatus: null,
      status: 'APPROVED',
    };
  }

  if (action === ModerationActionKind.REJECT) {
    return {
      requestedStatus: null,
      status: 'REJECTED',
    };
  }

  if (action === ModerationActionKind.ARCHIVE) {
    return {
      archivedAt: now,
      requestedStatus: null,
      status: 'ARCHIVED',
    };
  }

  return {
    archivedAt: null,
    requestedStatus: null,
    status: 'APPROVED',
  };
}

function projectReviewNotificationTitle(action: ModerationActionKind): string {
  if (action === ModerationActionKind.APPROVE) {
    return 'Project approved';
  }
  if (action === ModerationActionKind.REJECT) {
    return 'Project rejected';
  }
  if (action === ModerationActionKind.ARCHIVE) {
    return 'Project archived';
  }

  return 'Project restored';
}

function projectReviewNotificationBody(
  projectTitle: string,
  action: ModerationActionKind,
  reason: string | null,
): string {
  const decision =
    action === ModerationActionKind.APPROVE
      ? 'approved'
      : action === ModerationActionKind.REJECT
        ? 'rejected'
        : action === ModerationActionKind.ARCHIVE
          ? 'archived'
          : 'restored';
  const suffix = reason === null ? '' : ` Reason: ${reason}`;

  return `${projectTitle} was ${decision}.${suffix}`;
}

function moderationActionSelect() {
  return {
    createdAt: true,
    id: true,
    kind: true,
    moderator: {
      select: {
        displayName: true,
        id: true,
        username: true,
      },
    },
    projectId: true,
    reason: true,
  };
}

function moderationActionToContract(
  action: ModerationActionRow,
  projectId: string,
): ModerationActionContract {
  return {
    ...action,
    kind: action.kind,
    projectId: action.projectId ?? projectId,
  };
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}
