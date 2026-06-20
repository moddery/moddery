import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type SendNotificationInput } from '../graphql/send-notification.input.js';
import { NotificationDispatchService } from './notification-dispatch.service.js';
import { NotificationPreferencesService } from './notification-preferences.service.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationDispatchService: NotificationDispatchService,
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  async findViewerNotifications(
    userId: string,
    {
      limit = 20,
      offset = 0,
      type,
      unreadOnly,
    }: {
      limit?: number;
      offset?: number;
      type?: string | null;
      unreadOnly?: boolean | null;
    } = {},
  ) {
    const where = notificationWhere(userId, { type, unreadOnly });
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, notifications] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: notificationSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      notifications,
      totalHits,
    };
  }

  async findViewerNotificationList(
    userId: string,
    {
      type,
      unreadOnly,
    }: {
      type?: string | null;
      unreadOnly?: boolean | null;
    } = {},
  ) {
    const result = await this.findViewerNotifications(userId, {
      type,
      unreadOnly,
    });

    return result.notifications;
  }

  async findViewerNotificationTypes(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      distinct: ['type'],
      orderBy: [{ type: 'asc' }],
      select: { type: true },
      where: { userId },
    });

    return notifications.map((notification) => notification.type);
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        readAt: null,
        userId,
      },
    });
  }

  async markRead(userId: string, notificationId: string) {
    const update = await this.prisma.notification.updateMany({
      data: {
        readAt: new Date(),
        state: 'READ',
      },
      where: {
        id: notificationId,
        userId,
      },
    });
    if (update.count === 0) {
      throw new NotFoundException('Notification not found');
    }

    const notification = await this.prisma.notification.findFirst({
      select: notificationSelect(),
      where: {
        id: notificationId,
        userId,
      },
    });
    if (notification === null) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      data: {
        readAt: new Date(),
        state: 'READ',
      },
      where: {
        readAt: null,
        userId,
      },
    });

    return result.count;
  }

  async findViewerPreferences(userId: string) {
    return this.notificationPreferencesService.findViewerPreferences(userId);
  }

  updatePreference({
    channel,
    enabled,
    type,
    userId,
  }: {
    channel: string;
    enabled: boolean;
    type: string;
    userId: string;
  }) {
    return this.notificationPreferencesService.updatePreference({
      channel,
      enabled,
      type,
      userId,
    });
  }

  async sendNotification(input: SendNotificationInput) {
    return this.notificationDispatchService.sendNotification(input);
  }

  async sendUserNotification({
    actionUrl,
    body,
    title,
    type,
    userId,
  }: {
    actionUrl: string | null;
    body: string | null;
    title: string;
    type: string;
    userId: string;
  }) {
    return this.notificationDispatchService.sendUserNotification({
      actionUrl,
      body,
      title,
      type,
      userId,
    });
  }
}

function notificationSelect() {
  return {
    actionUrl: true,
    body: true,
    createdAt: true,
    deliveries: {
      orderBy: [{ scheduledAt: 'desc' as const }],
      select: {
        attempts: true,
        channel: true,
        id: true,
        lastError: true,
        scheduledAt: true,
        sentAt: true,
        state: true,
      },
      take: 5,
    },
    id: true,
    readAt: true,
    state: true,
    title: true,
    type: true,
  };
}

function notificationWhere(
  userId: string,
  {
    type,
    unreadOnly,
  }: {
    type?: string | null;
    unreadOnly?: boolean | null;
  },
) {
  const normalizedType = type?.trim().toLowerCase() ?? '';

  return {
    ...(normalizedType.length > 0 ? { type: normalizedType } : {}),
    ...(unreadOnly ? { readAt: null } : {}),
    userId,
  };
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}
