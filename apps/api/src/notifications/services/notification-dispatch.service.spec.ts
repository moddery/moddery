import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { NotificationDispatchService } from './notification-dispatch.service.js';
import { type NotificationPreferencesService } from './notification-preferences.service.js';

function createDispatchService(
  prisma: PrismaService,
  preferences: Pick<NotificationPreferencesService, 'enabledPreferences'>,
) {
  return new NotificationDispatchService(prisma, preferences as never);
}

describe(NotificationDispatchService.name, () => {
  test('sends notifications with enabled delivery channels', async () => {
    const creates: unknown[] = [];
    const service = createDispatchService(
      {
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
        user: {
          findFirst: () => Promise.resolve({ id: 'user-a' }),
        },
      } as unknown as PrismaService,
      {
        enabledPreferences: () =>
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
    );

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
    const service = createDispatchService(
      {
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
      } as unknown as PrismaService,
      {
        enabledPreferences: () =>
          Promise.resolve([
            {
              channel: 'IN_APP',
              enabled: true,
              type: 'message',
              userId: 'user-b',
            },
          ]),
      },
    );

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
