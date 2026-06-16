import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { NotificationsService } from './notifications.service.js';

describe(NotificationsService.name, () => {
  test('marks viewer notifications as read by id and user', async () => {
    const updates: unknown[] = [];
    const service = new NotificationsService({
      notification: {
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({
            id: 'notification-a',
            readAt: new Date('2026-01-01T00:00:00.000Z'),
            state: 'READ',
          });
        },
      },
    } as unknown as PrismaService);

    const result = await service.markRead('user-a', 'notification-a');

    expect(updates[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({ state: 'READ' }),
        where: {
          id: 'notification-a',
          userId: 'user-a',
        },
      }),
    );
    expect(result.state).toBe('READ');
  });

  test('loads saved notification preferences with defaults', async () => {
    const service = new NotificationsService({
      notificationPreference: {
        findMany: () =>
          Promise.resolve([
            {
              channel: 'EMAIL',
              enabled: false,
              type: 'project',
              updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            },
          ]),
      },
    } as unknown as PrismaService);

    const preferences = await service.findViewerPreferences('user-a');

    expect(
      preferences.some(
        (preference) =>
          preference.channel === 'EMAIL' &&
          !preference.enabled &&
          preference.type === 'project',
      ),
    ).toBe(true);
    expect(
      preferences.some(
        (preference) =>
          preference.channel === 'IN_APP' &&
          preference.enabled &&
          preference.type === 'team',
      ),
    ).toBe(true);
  });

  test('updates notification preferences by user, type, and channel', async () => {
    const upserts: unknown[] = [];
    const service = new NotificationsService({
      notificationPreference: {
        upsert: (query: unknown) => {
          upserts.push(query);
          return Promise.resolve({
            channel: 'EMAIL',
            enabled: true,
            type: 'team',
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          });
        },
      },
    } as unknown as PrismaService);

    const preference = await service.updatePreference({
      channel: 'email',
      enabled: true,
      type: ' team ',
      userId: 'user-a',
    });

    expect(upserts[0]).toEqual({
      create: {
        channel: 'EMAIL',
        enabled: true,
        type: 'team',
        userId: 'user-a',
      },
      update: { enabled: true },
      where: {
        userId_type_channel: {
          channel: 'EMAIL',
          type: 'team',
          userId: 'user-a',
        },
      },
    });
    expect(preference.enabled).toBe(true);
  });

  test('sends notifications with enabled delivery channels', async () => {
    const creates: unknown[] = [];
    const service = new NotificationsService({
      notification: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve({
            id: 'notification-a',
            title: 'Review update',
            type: 'moderation',
          });
        },
      },
      notificationPreference: {
        findMany: () =>
          Promise.resolve([
            {
              channel: 'EMAIL',
              enabled: true,
              type: 'moderation',
              userId: 'user-a',
            },
            {
              channel: 'IN_APP',
              enabled: true,
              type: 'moderation',
              userId: 'user-a',
            },
          ]),
      },
      user: {
        findFirst: () => Promise.resolve({ id: 'user-a' }),
      },
    } as unknown as PrismaService);

    const notification = await service.sendNotification({
      actionUrl: ' /dashboard ',
      body: '  Your project was reviewed. ',
      title: ' Review update ',
      type: ' Moderation ',
      username: 'creator',
    });

    expect(creates[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          actionUrl: '/dashboard',
          body: 'Your project was reviewed.',
          state: 'PENDING',
          title: 'Review update',
          type: 'moderation',
          userId: 'user-a',
        }),
      }),
    );
    expect(
      (
        creates[0] as {
          data: { deliveries: { create: { channel: string }[] } };
        }
      ).data.deliveries.create
        .map((delivery) => delivery.channel)
        .sort(),
    ).toEqual(['EMAIL', 'IN_APP']);
    expect(notification.id).toBe('notification-a');
  });
});
