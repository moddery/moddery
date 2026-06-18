import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { NotificationsService } from './notifications.service.js';

function createNotificationsService(prisma: PrismaService) {
  return new NotificationsService(prisma, {} as never, {} as never);
}

describe(NotificationsService.name, () => {
  test('loads viewer notifications with delivery state', async () => {
    const queries: unknown[] = [];
    const service = createNotificationsService({
      notification: {
        count: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(6);
        },
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
        where: { userId: 'user-a' },
      }),
    );
    expect(queries[1]).toEqual(
      expect.objectContaining({
        select: expect.objectContaining({
          deliveries: expect.objectContaining({
            take: 5,
          }),
        }),
        skip: 0,
        take: 20,
        where: { userId: 'user-a' },
      }),
    );
    expect(notifications.totalHits).toBe(6);
    expect(notifications.notifications[0]?.deliveries[0]?.channel).toBe(
      'EMAIL',
    );
  });

  test('loads filtered viewer notifications', async () => {
    const queries: unknown[] = [];
    const service = createNotificationsService({
      notification: {
        count: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(0);
        },
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([]);
        },
      },
    } as unknown as PrismaService);

    await service.findViewerNotifications('user-a', {
      limit: 12,
      offset: 24,
      type: ' Team ',
      unreadOnly: true,
    });

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: {
          readAt: null,
          type: 'team',
          userId: 'user-a',
        },
      }),
    );
    expect(queries[1]).toEqual(
      expect.objectContaining({
        skip: 24,
        take: 12,
        where: {
          readAt: null,
          type: 'team',
          userId: 'user-a',
        },
      }),
    );
  });

  test('loads the legacy viewer notification list from search results', async () => {
    const queries: unknown[] = [];
    const service = createNotificationsService({
      notification: {
        count: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(1);
        },
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              actionUrl: null,
              body: null,
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              deliveries: [],
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

    const notifications = await service.findViewerNotificationList('user-a');

    expect(queries[1]).toEqual(
      expect.objectContaining({
        skip: 0,
        take: 20,
        where: { userId: 'user-a' },
      }),
    );
    expect(notifications[0]?.title).toBe('Project update');
  });

  test('loads viewer notification types sorted by type', async () => {
    const queries: unknown[] = [];
    const service = createNotificationsService({
      notification: {
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([{ type: 'message' }, { type: 'team' }]);
        },
      },
    } as unknown as PrismaService);

    const types = await service.findViewerNotificationTypes('user-a');

    expect(queries[0]).toEqual({
      distinct: ['type'],
      orderBy: [{ type: 'asc' }],
      select: { type: true },
      where: { userId: 'user-a' },
    });
    expect(types).toEqual(['message', 'team']);
  });

  test('marks viewer notifications as read by id and user', async () => {
    const updates: unknown[] = [];
    const service = createNotificationsService({
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
    const service = createNotificationsService({
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
});
