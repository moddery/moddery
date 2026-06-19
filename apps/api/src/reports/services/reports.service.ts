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
    const text = requiredReportBody(body);
    const slug = requiredText(projectSlug, 'Project is required');
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.report.create({
      data: {
        body: text,
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
    const text = requiredReportBody(body);
    const id = requiredText(versionId, 'Version is required');
    const version = await this.prisma.version.findUnique({
      select: { id: true },
      where: { id },
    });

    if (version === null) {
      throw new NotFoundException('Version not found');
    }

    return this.prisma.report.create({
      data: {
        body: text,
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
    const text = requiredReportBody(body);
    const targetUsername = requiredText(username, 'User is required');
    const userTarget = await this.prisma.user.findFirst({
      select: { id: true },
      where: { username: { equals: targetUsername, mode: 'insensitive' } },
    });

    if (userTarget === null) {
      throw new NotFoundException('User not found');
    }

    if (userTarget.id === reporterId) {
      throw new BadRequestException('Cannot report yourself');
    }

    return this.prisma.report.create({
      data: {
        body: text,
        reason,
        reporterId,
        userTargetId: userTarget.id,
      },
      select: reportSelect(),
    });
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

function requiredReportBody(value: string): string {
  const text = requiredText(value, 'Report body is required');
  if (text.length < 8) {
    throw new BadRequestException('Report body must be at least 8 characters');
  }

  return text;
}

function requiredText(value: string, message: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new BadRequestException(message);
  }

  return trimmed;
}
