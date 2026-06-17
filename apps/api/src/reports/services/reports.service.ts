import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { type ReportReason, type ReportState } from '@moddery/shared';

import { NotificationsService } from '../../notifications/services/notifications.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  async findModerationReports({
    limit = 50,
    offset = 0,
  }: {
    limit?: number;
    offset?: number;
  } = {}) {
    const where = activeReportWhere();
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, reports] = await Promise.all([
      this.prisma.report.count({ where }),
      this.prisma.report.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: reportSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      reports,
      totalHits,
    };
  }

  async findModerationReportList() {
    const result = await this.findModerationReports();

    return result.reports;
  }

  async updateReportState({ id, state }: { id: string; state: ReportState }) {
    try {
      return await this.prisma.report.update({
        data: {
          closedAt: state === 'CLOSED' ? new Date() : null,
          state,
        },
        select: reportSelect(),
        where: { id },
      });
    } catch {
      throw new NotFoundException('Report not found');
    }
  }

  async createProjectReport({
    body,
    projectSlug,
    reason,
    reporterId,
  }: {
    body: string;
    projectSlug: string;
    reason: ReportReason;
    reporterId: string;
  }) {
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.report.create({
      data: {
        body: body.trim(),
        projectId: project.id,
        reason,
        reporterId,
      },
      select: reportSelect(),
    });
  }

  async createVersionReport({
    body,
    reason,
    reporterId,
    versionId,
  }: {
    body: string;
    reason: ReportReason;
    reporterId: string;
    versionId: string;
  }) {
    const version = await this.prisma.version.findUnique({
      select: { id: true },
      where: { id: versionId },
    });

    if (version === null) {
      throw new NotFoundException('Version not found');
    }

    return this.prisma.report.create({
      data: {
        body: body.trim(),
        reason,
        reporterId,
        versionId: version.id,
      },
      select: reportSelect(),
    });
  }

  async createUserReport({
    body,
    reason,
    reporterId,
    username,
  }: {
    body: string;
    reason: ReportReason;
    reporterId: string;
    username: string;
  }) {
    const userTarget = await this.prisma.user.findUnique({
      select: { id: true },
      where: { username },
    });

    if (userTarget === null) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.report.create({
      data: {
        body: body.trim(),
        reason,
        reporterId,
        userTargetId: userTarget.id,
      },
      select: reportSelect(),
    });
  }

  async findReportThread(reportId: string) {
    await this.assertReportExists(reportId);

    return this.prisma.thread.upsert({
      create: {
        reportId,
        subject: `Report ${reportId}`,
      },
      include: threadInclude(),
      update: {},
      where: { reportId },
    });
  }

  async createReportThreadMessage({
    authorId,
    body,
    reportId,
  }: {
    authorId: string;
    body: string;
    reportId: string;
  }) {
    const text = body.trim();
    if (text.length === 0) {
      throw new BadRequestException('Message body is required');
    }

    await this.assertReportExists(reportId);

    const thread = await this.prisma.thread.upsert({
      create: {
        reportId,
        subject: `Report ${reportId}`,
      },
      select: { id: true },
      update: {},
      where: { reportId },
    });

    await this.prisma.threadMessage.create({
      data: {
        authorId,
        body: text,
        threadId: thread.id,
      },
    });

    await this.prisma.threadMember.upsert({
      create: {
        threadId: thread.id,
        userId: authorId,
      },
      update: { lastReadAt: new Date() },
      where: {
        threadId_userId: {
          threadId: thread.id,
          userId: authorId,
        },
      },
    });

    return this.prisma.thread.findUniqueOrThrow({
      include: threadInclude(),
      where: { id: thread.id },
    });
  }

  async findViewerDirectThreads(
    userId: string,
    {
      limit = 25,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const where = directThreadListWhere(userId);
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, threads] = await Promise.all([
      this.prisma.thread.count({ where }),
      this.prisma.thread.findMany({
        include: threadInclude(),
        orderBy: [{ updatedAt: 'desc' }],
        skip,
        take,
        where,
      }),
    ]);

    return {
      threads,
      totalHits,
    };
  }

  async findViewerDirectThreadList(userId: string) {
    const result = await this.findViewerDirectThreads(userId);

    return result.threads;
  }

  async createDirectThread({
    authorId,
    body,
    username,
  }: {
    authorId: string;
    body: string;
    username: string;
  }) {
    const text = requiredBody(body);
    const target = await this.prisma.user.findFirst({
      select: { displayName: true, id: true, username: true },
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (target === null) {
      throw new NotFoundException('User not found');
    }

    if (target.id === authorId) {
      throw new BadRequestException(
        'Cannot start a direct thread with yourself',
      );
    }

    const existingThread = await this.prisma.thread.findFirst({
      include: threadInclude(),
      orderBy: [{ updatedAt: 'desc' }],
      where: directThreadWhere(authorId, target.id),
    });

    if (existingThread !== null) {
      await this.createDirectThreadMessage({
        authorId,
        body: text,
        threadId: existingThread.id,
      });

      return this.findViewerThreadOrThrow({
        threadId: existingThread.id,
        userId: authorId,
      });
    }

    const thread = await this.prisma.thread.create({
      data: {
        members: {
          create: [{ userId: authorId }, { userId: target.id }],
        },
        messages: {
          create: {
            authorId,
            body: text,
          },
        },
        subject: `Direct message with ${target.username}`,
      },
      select: { id: true },
    });

    const directThread = await this.findViewerThreadOrThrow({
      threadId: thread.id,
      userId: authorId,
    });
    await this.notifyDirectThreadMembers({
      authorId,
      body: text,
      thread: directThread,
    });

    return directThread;
  }

  async createDirectThreadMessage({
    authorId,
    body,
    threadId,
  }: {
    authorId: string;
    body: string;
    threadId: string;
  }) {
    const text = requiredBody(body);
    await this.assertThreadMember({ threadId, userId: authorId });

    await this.prisma.threadMessage.create({
      data: {
        authorId,
        body: text,
        threadId,
      },
    });

    await this.prisma.threadMember.update({
      data: { lastReadAt: new Date() },
      where: {
        threadId_userId: {
          threadId,
          userId: authorId,
        },
      },
    });

    const directThread = await this.findViewerThreadOrThrow({
      threadId,
      userId: authorId,
    });
    await this.notifyDirectThreadMembers({
      authorId,
      body: text,
      thread: directThread,
    });

    return directThread;
  }

  async findProjectModerationNotes(
    projectSlug: string,
    {
      limit = 25,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    const where = { projectId: project.id };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, notes] = await Promise.all([
      this.prisma.moderationNote.count({ where }),
      this.prisma.moderationNote.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: moderationNoteSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      notes,
      totalHits,
    };
  }

  async findProjectModerationNoteList(projectSlug: string) {
    const result = await this.findProjectModerationNotes(projectSlug);

    return result.notes;
  }

  async findUserModerationNotes(
    username: string,
    {
      limit = 25,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const user = await this.prisma.user.findFirst({
      select: { id: true },
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    const where = { userId: user.id };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, notes] = await Promise.all([
      this.prisma.moderationNote.count({ where }),
      this.prisma.moderationNote.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: moderationNoteSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      notes,
      totalHits,
    };
  }

  async findUserModerationNoteList(username: string) {
    const result = await this.findUserModerationNotes(username);

    return result.notes;
  }

  async createProjectModerationNote({
    authorId,
    body,
    projectSlug,
  }: {
    authorId: string;
    body: string;
    projectSlug: string;
  }) {
    const text = requiredBody(body);
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.moderationNote.create({
      data: {
        authorId,
        body: text,
        projectId: project.id,
      },
      select: moderationNoteSelect(),
    });
  }

  async createUserModerationNote({
    authorId,
    body,
    username,
  }: {
    authorId: string;
    body: string;
    username: string;
  }) {
    const text = requiredBody(body);
    const user = await this.prisma.user.findFirst({
      select: { id: true },
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.moderationNote.create({
      data: {
        authorId,
        body: text,
        userId: user.id,
      },
      select: moderationNoteSelect(),
    });
  }

  private async assertReportExists(reportId: string) {
    const report = await this.prisma.report.findUnique({
      select: { id: true },
      where: { id: reportId },
    });

    if (report === null) {
      throw new NotFoundException('Report not found');
    }
  }

  private async assertThreadMember({
    threadId,
    userId,
  }: {
    threadId: string;
    userId: string;
  }) {
    const threadMember = await this.prisma.threadMember.findUnique({
      select: { threadId: true },
      where: {
        threadId_userId: {
          threadId,
          userId,
        },
      },
    });

    if (threadMember === null) {
      throw new ForbiddenException('Thread access required');
    }
  }

  private async findViewerThreadOrThrow({
    threadId,
    userId,
  }: {
    threadId: string;
    userId: string;
  }) {
    const thread = await this.prisma.thread.findFirst({
      include: threadInclude(),
      where: {
        id: threadId,
        members: { some: { userId } },
        reportId: null,
      },
    });

    if (thread === null) {
      throw new NotFoundException('Thread not found');
    }

    return thread;
  }

  private async notifyDirectThreadMembers({
    authorId,
    body,
    thread,
  }: {
    authorId: string;
    body: string;
    thread: Awaited<ReturnType<ReportsService['findViewerThreadOrThrow']>>;
  }) {
    if (this.notificationsService === undefined) {
      return;
    }

    const notificationsService = this.notificationsService;
    const author = thread.members.find((member) => member.user.id === authorId);
    const authorName =
      author?.user.displayName ?? author?.user.username ?? 'A user';
    const recipients = thread.members.filter(
      (member) => member.user.id !== authorId,
    );

    await Promise.all(
      recipients.map((recipient) =>
        notificationsService.sendUserNotification({
          actionUrl: '/dashboard',
          body,
          title: `New message from ${authorName}`,
          type: 'message',
          userId: recipient.user.id,
        }),
      ),
    );
  }
}

function reportSelect() {
  return {
    body: true,
    closedAt: true,
    createdAt: true,
    id: true,
    project: {
      select: {
        id: true,
        kind: true,
        slug: true,
        title: true,
      },
    },
    projectId: true,
    reason: true,
    reporter: {
      select: {
        displayName: true,
        id: true,
        username: true,
      },
    },
    state: true,
    userTarget: {
      select: {
        displayName: true,
        id: true,
        username: true,
      },
    },
    userTargetId: true,
    version: {
      select: {
        id: true,
        name: true,
        project: {
          select: {
            id: true,
            kind: true,
            slug: true,
            title: true,
          },
        },
        versionNumber: true,
      },
    },
    versionId: true,
  };
}

function activeReportWhere() {
  return { state: { in: ['OPEN', 'TRIAGED'] as ReportState[] } };
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}

function threadInclude() {
  return {
    members: {
      orderBy: [{ createdAt: 'asc' as const }],
      select: {
        createdAt: true,
        lastReadAt: true,
        user: {
          select: {
            displayName: true,
            id: true,
            username: true,
          },
        },
      },
    },
    messages: {
      orderBy: { createdAt: 'asc' as const },
      select: {
        author: {
          select: {
            displayName: true,
            id: true,
            username: true,
          },
        },
        body: true,
        createdAt: true,
        id: true,
      },
    },
  };
}

function directThreadListWhere(userId: string) {
  return {
    members: { some: { userId } },
    reportId: null,
  };
}

function directThreadWhere(firstUserId: string, secondUserId: string) {
  return {
    AND: [
      { members: { some: { userId: firstUserId } } },
      { members: { some: { userId: secondUserId } } },
      { members: { every: { userId: { in: [firstUserId, secondUserId] } } } },
    ],
    reportId: null,
  };
}

function moderationNoteSelect() {
  return {
    author: {
      select: {
        displayName: true,
        id: true,
        username: true,
      },
    },
    body: true,
    createdAt: true,
    id: true,
    projectId: true,
    updatedAt: true,
    userId: true,
  };
}

function requiredBody(body: string): string {
  const text = body.trim();
  if (text.length === 0) {
    throw new BadRequestException('Note body is required');
  }

  return text;
}
