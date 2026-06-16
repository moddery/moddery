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
});
