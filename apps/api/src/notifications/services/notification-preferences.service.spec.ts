import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { NotificationPreferencesService } from './notification-preferences.service.js';

describe(NotificationPreferencesService.name, () => {
  test('loads saved notification preferences with defaults', async () => {
    const service = new NotificationPreferencesService({
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
    const service = new NotificationPreferencesService({
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

  test('returns saved enabled preferences over defaults', async () => {
    const service = new NotificationPreferencesService({
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
    } as unknown as PrismaService);

    const preferences = await service.enabledPreferences(
      'user-a',
      'moderation',
    );

    expect(preferences.map((preference) => preference.channel).sort()).toEqual([
      'EMAIL',
      'IN_APP',
    ]);
  });

  test('uses enabled in-app default for internal message notifications', async () => {
    const service = new NotificationPreferencesService({
      notificationPreference: {
        findMany: () => Promise.resolve([]),
      },
    } as unknown as PrismaService);

    const preferences = await service.enabledPreferences('user-a', 'message');

    expect(preferences).toEqual([
      {
        channel: 'IN_APP',
        enabled: true,
        type: 'message',
        userId: 'user-a',
      },
    ]);
  });
});
