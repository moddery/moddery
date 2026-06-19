import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

describe(UsersService.name, () => {
  test('updates viewer profile fields and reloads the user profile', async () => {
    const updates: unknown[] = [];
    const service = new UsersService({
      user: {
        findUnique: () =>
          Promise.resolve({
            _count: {
              collections: 0,
              ownedOrganizations: 0,
              projectFollows: 0,
              teamMemberships: 0,
            },
            avatarUrl: 'https://example.test/avatar.png',
            bio: null,
            collections: [],
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            displayName: 'Creator',
            email: 'creator@example.test',
            emailVerifiedAt: new Date('2026-01-02T00:00:00.000Z'),
            friendRequestsReceived: [],
            friendRequestsSent: [],
            id: 'user-a',
            newsletterOptIn: true,
            role: 'USER',
            status: 'ACTIVE',
            teamMemberships: [],
            twoFactorEnabled: false,
            username: 'creator',
          }),
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const profile = await service.updateViewerProfile('user-a', {
      avatarUrl: ' https://example.test/avatar.png ',
      bio: '   ',
      displayName: ' Creator ',
      email: ' creator+updated@example.test ',
      newsletterOptIn: true,
    });

    expect(updates[0]).toEqual({
      data: {
        avatarUrl: 'https://example.test/avatar.png',
        bio: null,
        displayName: 'Creator',
        email: 'creator+updated@example.test',
        emailVerifiedAt: null,
        newsletterOptIn: true,
      },
      where: { id: 'user-a' },
    });
    expect(profile?.displayName).toBe('Creator');
    expect(profile?.bio).toBeNull();
    expect(profile?.email).toBe('creator@example.test');
    expect(profile?.newsletterOptIn).toBe(true);
  });
});
