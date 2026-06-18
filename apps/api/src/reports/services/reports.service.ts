import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type ReportReason, type ReportState } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

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

  private async assertReportExists(reportId: string) {
    const report = await this.prisma.report.findUnique({
      select: { id: true },
      where: { id: reportId },
    });

    if (report === null) {
      throw new NotFoundException('Report not found');
    }
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
