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
              projectFollows: 0,
              teamMemberships: 0,
            },
            avatarUrl: 'https://example.test/avatar.png',
            bio: null,
            collections: [],
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            displayName: 'Creator',
            email: 'creator@example.test',
            emailVerifiedAt: null,
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
      email: ' creator@example.test ',
      newsletterOptIn: true,
    });

    expect(updates[0]).toEqual({
      data: {
        avatarUrl: 'https://example.test/avatar.png',
        bio: null,
        displayName: 'Creator',
        email: 'creator@example.test',
        newsletterOptIn: true,
      },
      where: { id: 'user-a' },
    });
    expect(profile?.displayName).toBe('Creator');
    expect(profile?.bio).toBeNull();
    expect(profile?.email).toBe('creator@example.test');
    expect(profile?.newsletterOptIn).toBe(true);
  });

  test('updates user account role and status for admins', async () => {
    const updates: unknown[] = [];
    const service = new UsersService({
      user: {
        findUnique: ({ where }: { where: { id: string } }) =>
          Promise.resolve({
            _count: {
              collections: 0,
              projectFollows: 0,
              teamMemberships: 0,
            },
            avatarUrl: null,
            bio: null,
            collections: [],
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            displayName: null,
            email: 'moderator@example.test',
            emailVerifiedAt: null,
            id: where.id,
            newsletterOptIn: false,
            role: 'MODERATOR',
            status: 'SUSPENDED',
            teamMemberships: [],
            twoFactorEnabled: false,
            username: 'moderator',
          }),
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const profile = await service.updateUserAccount(
      {
        role: 'moderator',
        status: 'suspended',
        userId: 'user-b',
      },
      'admin-a',
    );

    expect(updates[0]).toEqual({
      data: {
        role: 'MODERATOR',
        status: 'SUSPENDED',
      },
      where: { id: 'user-b' },
    });
    expect(profile.role).toBe('MODERATOR');
    expect(profile.status).toBe('SUSPENDED');
  });
});
