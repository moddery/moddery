import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type SendNotificationInput } from '../graphql/send-notification.input.js';
import { NotificationPreferencesService } from './notification-preferences.service.js';

@Injectable()
export class NotificationDispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

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

    const preferences =
      await this.notificationPreferencesService.enabledPreferences(
        recipient.id,
        type,
      );

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
    const preferences =
      await this.notificationPreferencesService.enabledPreferences(
        userId,
        normalizedType,
      );

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
