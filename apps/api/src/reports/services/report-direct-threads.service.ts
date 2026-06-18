import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';

import { NotificationsService } from '../../notifications/services/notifications.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ReportDirectThreadsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

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
    thread: Awaited<
      ReturnType<ReportDirectThreadsService['findViewerThreadOrThrow']>
    >;
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
          actionUrl: '/dashboard#dashboard-messages',
          body,
          title: `New message from ${authorName}`,
          type: 'message',
          userId: recipient.user.id,
        }),
      ),
    );
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

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}

function requiredBody(body: string): string {
  const text = body.trim();
  if (text.length === 0) {
    throw new BadRequestException('Message body is required');
  }

  return text;
}
