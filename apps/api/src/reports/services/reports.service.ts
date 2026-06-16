import { Injectable, NotFoundException } from '@nestjs/common';
import { type ReportReason, type ReportState } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  findModerationReports() {
    return this.prisma.report.findMany({
      orderBy: [{ createdAt: 'desc' }],
      select: reportSelect(),
      take: 50,
      where: { state: { in: ['OPEN', 'TRIAGED'] } },
    });
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
    });
  }
}

function reportSelect() {
  return {
    body: true,
    createdAt: true,
    id: true,
    project: {
      select: {
        id: true,
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
    userTargetId: true,
    versionId: true,
  };
}
