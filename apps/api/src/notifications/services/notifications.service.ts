import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type SendNotificationInput } from '../graphql/send-notification.input.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

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

  markRead(userId: string, notificationId: string) {
    return this.prisma.notification.update({
      data: {
        readAt: new Date(),
        state: 'READ',
      },
      where: {
        id: notificationId,
        userId,
      },
    });
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
    const saved = await this.prisma.notificationPreference.findMany({
      orderBy: [{ type: 'asc' }, { channel: 'asc' }],
      where: { userId },
    });
    const savedKeys = new Set(
      saved.map((preference) => preferenceKey(preference)),
    );
    const defaults = defaultPreferences()
      .filter((preference) => !savedKeys.has(preferenceKey(preference)))
      .map((preference) => ({
        ...preference,
        updatedAt: new Date(0),
      }));

    return [...saved, ...defaults].sort(comparePreferences);
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
    const normalizedType = type.trim().toLowerCase();
    const normalizedChannel = notificationChannel(channel);

    return this.prisma.notificationPreference.upsert({
      create: {
        channel: normalizedChannel,
        enabled,
        type: normalizedType,
        userId,
      },
      update: { enabled },
      where: {
        userId_type_channel: {
          channel: normalizedChannel,
          type: normalizedType,
          userId,
        },
      },
    });
  }

  async sendNotification(input: SendNotificationInput) {
    const type = requiredTrim(
      input.type,
      'Notification type is required',
    ).toLowerCase();
    const title = requiredTrim(input.title, 'Notification title is required');
    const recipient = await this.prisma.user.findFirst({
      select: { id: true },
      where: {
        username: {
          equals: input.username.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (recipient === null) {
      throw new NotFoundException('User not found');
    }

    const preferences = await this.enabledPreferences(recipient.id, type);

    return this.prisma.notification.create({
      data: {
        actionUrl: nullableTrim(input.actionUrl),
        body: nullableTrim(input.body),
        deliveries: {
          create: preferences.map((preference) => ({
            channel: preference.channel,
          })),
        },
        state: 'PENDING',
        title,
        type,
        userId: recipient.id,
      },
    });
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
    const normalizedType = requiredTrim(
      type,
      'Notification type is required',
    ).toLowerCase();
    const preferences = await this.enabledPreferences(userId, normalizedType);

    return this.prisma.notification.create({
      data: {
        actionUrl,
        body,
        deliveries: {
          create: preferences.map((preference) => ({
            channel: preference.channel,
          })),
        },
        state: 'PENDING',
        title: requiredTrim(title, 'Notification title is required'),
        type: normalizedType,
        userId,
      },
    });
  }

  private async enabledPreferences(userId: string, type: string) {
    const saved = await this.prisma.notificationPreference.findMany({
      where: { type, userId },
    });
    const savedByChannel = new Map(
      saved.map((preference) => [preference.channel, preference]),
    );

    return defaultPreferences()
      .filter((preference) => preference.type === type)
      .map(
        (preference) =>
          savedByChannel.get(preference.channel) ?? {
            ...preference,
            userId,
          },
      )
      .filter((preference) => preference.enabled);
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

function defaultPreferences() {
  return [
    { channel: NotificationChannel.IN_APP, enabled: true, type: 'project' },
    { channel: NotificationChannel.EMAIL, enabled: true, type: 'project' },
    { channel: NotificationChannel.IN_APP, enabled: true, type: 'moderation' },
    { channel: NotificationChannel.EMAIL, enabled: false, type: 'moderation' },
    { channel: NotificationChannel.IN_APP, enabled: true, type: 'message' },
    { channel: NotificationChannel.EMAIL, enabled: false, type: 'message' },
    { channel: NotificationChannel.IN_APP, enabled: true, type: 'team' },
    { channel: NotificationChannel.EMAIL, enabled: true, type: 'team' },
  ];
}

function notificationChannel(channel: string): NotificationChannel {
  const normalized = channel.trim().toUpperCase();
  return normalized === NotificationChannel.EMAIL
    ? NotificationChannel.EMAIL
    : NotificationChannel.IN_APP;
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function requiredTrim(value: string, message: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new BadRequestException(message);
  }

  return trimmed;
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}

function preferenceKey({
  channel,
  type,
}: {
  channel: string;
  type: string;
}): string {
  return `${type}:${channel}`;
}

function comparePreferences(
  left: { channel: string; type: string },
  right: { channel: string; type: string },
): number {
  return (
    left.type.localeCompare(right.type) ||
    left.channel.localeCompare(right.channel)
  );
}
