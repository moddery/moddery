import { Injectable } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';

export interface EnabledNotificationPreference {
  channel: NotificationChannel;
  enabled: boolean;
  type: string;
  userId: string;
}

@Injectable()
export class NotificationPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async enabledPreferences(
    userId: string,
    type: string,
  ): Promise<EnabledNotificationPreference[]> {
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
