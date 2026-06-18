import { describe, expect, test } from 'bun:test';
import { NotificationState } from '@prisma/client';

import { type NotificationsService } from '../../notifications/services/notifications.service.js';
import { type PrismaService } from '../../prisma/prisma.service.js';
import { ReportDirectThreadsService } from './report-direct-threads.service.js';

describe(ReportDirectThreadsService.name, () => {
  test('loads viewer direct threads with pagination', async () => {
    const queries: unknown[] = [];
    const service = new ReportDirectThreadsService({
      thread: {
        count: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(7);
        },
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              id: 'thread-a',
              members: [],
              messages: [],
              reportId: null,
              subject: 'Direct message with target',
              updatedAt: new Date('2026-01-02T00:00:00.000Z'),
            },
          ]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findViewerDirectThreads('user-a', {
      limit: 12,
      offset: 24,
    });

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: {
          members: { some: { userId: 'user-a' } },
          reportId: null,
        },
      }),
    );
    expect(queries[1]).toEqual(
      expect.objectContaining({
        include: expect.any(Object),
        orderBy: [{ updatedAt: 'desc' }],
        skip: 24,
        take: 12,
        where: {
          members: { some: { userId: 'user-a' } },
          reportId: null,
        },
      }),
    );
    expect(result.totalHits).toBe(7);
    expect(result.threads[0]?.id).toBe('thread-a');
  });

  test('loads the legacy viewer direct thread list from search results', async () => {
    const queries: unknown[] = [];
    const service = new ReportDirectThreadsService({
      thread: {
        count: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(1);
        },
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              id: 'thread-a',
              members: [],
              messages: [],
              reportId: null,
              subject: 'Direct message with target',
              updatedAt: new Date('2026-01-02T00:00:00.000Z'),
            },
          ]);
        },
      },
    } as unknown as PrismaService);

    const threads = await service.findViewerDirectThreadList('user-a');

    expect(queries[1]).toEqual(
      expect.objectContaining({
        skip: 0,
        take: 25,
        where: {
          members: { some: { userId: 'user-a' } },
          reportId: null,
        },
      }),
    );
    expect(threads[0]?.id).toBe('thread-a');
  });

  test('creates direct threads with both members and first message', async () => {
    const creates: unknown[] = [];
    const notifications: unknown[] = [];
    const service = new ReportDirectThreadsService(
      {
        thread: {
          create: (query: unknown) => {
            creates.push(query);
            return Promise.resolve({ id: 'thread-a' });
          },
          findFirst: (query: unknown) => {
            if (
              typeof query === 'object' &&
              query !== null &&
              'where' in query &&
              (query as { where?: { id?: string } }).where?.id === 'thread-a'
            ) {
              return Promise.resolve(directThreadRow());
            }

            return Promise.resolve(null);
          },
        },
        user: {
          findFirst: () =>
            Promise.resolve({
              displayName: 'Target',
              id: 'user-b',
              username: 'target',
            }),
        },
      } as unknown as PrismaService,
      notificationServiceMock(notifications),
    );

    const thread = await service.createDirectThread({
      authorId: 'user-a',
      body: '  Hey there.  ',
      username: 'target',
    });

    expect(creates[0]).toEqual({
      data: {
        members: {
          create: [{ userId: 'user-a' }, { userId: 'user-b' }],
        },
        messages: {
          create: {
            authorId: 'user-a',
            body: 'Hey there.',
          },
        },
        subject: 'Direct message with target',
      },
      select: { id: true },
    });
    expect(thread.messages[0]?.body).toBe('Hey there.');
    expect(notifications[0]).toEqual(
      expect.objectContaining({
        actionUrl: '/dashboard#dashboard-account',
        body: 'Hey there.',
        title: 'New message from Sender',
        type: 'message',
        userId: 'user-b',
      }),
    );
  });

  test('requires direct thread membership before creating messages', async () => {
    const service = new ReportDirectThreadsService({
      threadMember: {
        findUnique: () => Promise.resolve(null),
      },
    } as unknown as PrismaService);

    let thrown: unknown;
    try {
      await service.createDirectThreadMessage({
        authorId: 'user-a',
        body: 'Nope',
        threadId: 'thread-a',
      });
    } catch (caught) {
      thrown = caught;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe('Thread access required');
  });
});

function notificationServiceMock(
  notifications: unknown[],
): NotificationsService {
  return {
    sendUserNotification: (notification: unknown) => {
      notifications.push(notification);
      return Promise.resolve({
        actionUrl: '/dashboard#dashboard-account',
        body: 'Hey there.',
        createdAt: new Date('2026-01-01T00:01:00.000Z'),
        id: 'notification-a',
        readAt: null,
        state: NotificationState.PENDING,
        title: 'New message from Sender',
        type: 'message',
        userId: 'user-b',
      });
    },
  } as unknown as NotificationsService;
}

function directThreadRow() {
  return {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 'thread-a',
    members: [
      {
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        lastReadAt: null,
        user: {
          displayName: 'Sender',
          id: 'user-a',
          username: 'sender',
        },
      },
      {
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        lastReadAt: null,
        user: {
          displayName: 'Target',
          id: 'user-b',
          username: 'target',
        },
      },
    ],
    messages: [
      {
        author: {
          displayName: 'Sender',
          id: 'user-a',
          username: 'sender',
        },
        body: 'Hey there.',
        createdAt: new Date('2026-01-01T00:01:00.000Z'),
        id: 'message-a',
      },
    ],
    reportId: null,
    subject: 'Direct message with target',
    updatedAt: new Date('2026-01-01T00:01:00.000Z'),
  };
}
