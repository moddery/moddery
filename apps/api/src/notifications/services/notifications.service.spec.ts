import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { NotificationsService } from './notifications.service.js';

describe(NotificationsService.name, () => {
  test('loads viewer notifications with delivery state', async () => {
    const queries: unknown[] = [];
    const service = new NotificationsService({
      notification: {
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              actionUrl: '/dashboard',
              body: 'Ready for review',
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              deliveries: [
                {
                  attempts: 1,
                  channel: 'EMAIL',
                  id: 'delivery-a',
                  lastError: null,
                  scheduledAt: new Date('2026-01-01T00:00:00.000Z'),
                  sentAt: new Date('2026-01-01T00:01:00.000Z'),
                  state: 'SENT',
                },
              ],
              id: 'notification-a',
              readAt: null,
              state: 'PENDING',
              title: 'Project update',
              type: 'project',
            },
          ]);
        },
      },
    } as unknown as PrismaService);

    const notifications = await service.findViewerNotifications('user-a');

    expect(queries[0]).toEqual(
      expect.objectContaining({
        select: expect.objectContaining({
          deliveries: expect.objectContaining({
            take: 5,
          }),
        }),
        where: { userId: 'user-a' },
      }),
    );
    expect(notifications[0]?.deliveries[0]?.channel).toBe('EMAIL');
  });

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

  test('marks all unread viewer notifications as read', async () => {
    const updates: unknown[] = [];
    const service = new NotificationsService({
      notification: {
        updateMany: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({ count: 3 });
        },
      },
    } as unknown as PrismaService);

    const count = await service.markAllRead('user-a');

    expect(updates[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({ state: 'READ' }),
        where: {
          readAt: null,
          userId: 'user-a',
        },
      }),
    );
    expect(count).toBe(3);
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

  test('sends internal notifications by user id', async () => {
    const creates: unknown[] = [];
    const service = new NotificationsService({
      notification: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve({
            id: 'notification-a',
            title: 'New message',
            type: 'message',
          });
        },
      },
      notificationPreference: {
        findMany: () => Promise.resolve([]),
      },
    } as unknown as PrismaService);

    const notification = await service.sendUserNotification({
      actionUrl: '/dashboard',
      body: 'Hello.',
      title: 'New message',
      type: 'message',
      userId: 'user-b',
    });

    expect(creates[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          actionUrl: '/dashboard',
          body: 'Hello.',
          state: 'PENDING',
          title: 'New message',
          type: 'message',
          userId: 'user-b',
        }),
      }),
    );
    expect(
      (
        creates[0] as {
          data: { deliveries: { create: { channel: string }[] } };
        }
      ).data.deliveries.create,
    ).toEqual([{ channel: 'IN_APP' }]);
    expect(notification.id).toBe('notification-a');
  });
});
