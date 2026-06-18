import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ReportThreadsService {
  constructor(private readonly prisma: PrismaService) {}

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
