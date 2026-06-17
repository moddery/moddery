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
            friendRequestsReceived: [],
            friendRequestsSent: [],
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

  test('loads active public users without private account fields', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
      user: {
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              _count: {
                collections: 2,
                projectFollows: 3,
                teamMemberships: 4,
              },
              avatarUrl: null,
              bio: 'Ships useful projects.',
              collections: [],
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              displayName: 'Creator',
              email: false,
              emailVerifiedAt: false,
              friendRequestsReceived: [{ id: 'friend-a' }],
              friendRequestsSent: [{ id: 'friend-b' }],
              id: 'user-a',
              newsletterOptIn: false,
              role: 'USER',
              status: 'ACTIVE',
              teamMemberships: [],
              twoFactorEnabled: false,
              username: 'creator',
            },
          ]);
        },
      },
    } as unknown as PrismaService);

    const users = await service.findPublicUsers();

    expect(queries[0]).toMatchObject({
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
      where: { status: 'ACTIVE' },
    });
    expect(users[0]).toMatchObject({
      bio: 'Ships useful projects.',
      collectionCount: 2,
      email: null,
      emailVerifiedAt: null,
      followedProjectCount: 3,
      friendCount: 2,
      newsletterOptIn: false,
      projectCount: 4,
      twoFactorEnabled: false,
      username: 'creator',
    });
  });

  test('filters public users by search text', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
      user: {
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              _count: {
                collections: 0,
                projectFollows: 0,
                teamMemberships: 0,
              },
              avatarUrl: null,
              bio: 'Builds utility projects.',
              collections: [],
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              displayName: 'Creator',
              email: false,
              emailVerifiedAt: false,
              friendRequestsReceived: [],
              friendRequestsSent: [],
              id: 'user-a',
              newsletterOptIn: false,
              role: 'USER',
              status: 'ACTIVE',
              teamMemberships: [],
              twoFactorEnabled: false,
              username: 'creator',
            },
          ]);
        },
      },
    } as unknown as PrismaService);

    const users = await service.findPublicUsers({ search: ' utility ' });

    expect(queries[0]).toMatchObject({
      where: {
        OR: expect.arrayContaining([
          {
            username: {
              contains: 'utility',
              mode: 'insensitive',
            },
          },
          {
            teamMemberships: {
              some: {
                acceptedAt: { not: null },
                team: {
                  project: {
                    is: expect.objectContaining({
                      status: 'APPROVED',
                    }) as object,
                  },
                },
              },
            },
          },
        ]) as unknown[],
        status: 'ACTIVE',
      },
    });
    expect(users[0]?.username).toBe('creator');
  });

  test('accepts an incoming friend request when sending one back', async () => {
    const updates: unknown[] = [];
    const service = new UsersService({
      friend: {
        findFirst: () =>
          Promise.resolve({
            acceptedAt: null,
            addressee: {
              avatarUrl: null,
              displayName: 'Creator',
              id: 'user-a',
              username: 'creator',
            },
            addresseeId: 'user-a',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'friend-a',
            requester: {
              avatarUrl: null,
              displayName: 'Builder',
              id: 'user-b',
              username: 'builder',
            },
            requesterId: 'user-b',
            state: 'PENDING',
          }),
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({
            acceptedAt: new Date('2026-01-02T00:00:00.000Z'),
            addressee: {
              avatarUrl: null,
              displayName: 'Creator',
              id: 'user-a',
              username: 'creator',
            },
            addresseeId: 'user-a',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'friend-a',
            requester: {
              avatarUrl: null,
              displayName: 'Builder',
              id: 'user-b',
              username: 'builder',
            },
            requesterId: 'user-b',
            state: 'ACCEPTED',
          });
        },
      },
      user: {
        findFirst: () =>
          Promise.resolve({
            avatarUrl: null,
            displayName: 'Builder',
            id: 'user-b',
            username: 'builder',
          }),
      },
    } as unknown as PrismaService);

    const friendship = await service.sendFriendRequest('user-a', 'builder');

    expect(updates[0]).toEqual({
      data: {
        acceptedAt: expect.any(Date) as Date,
        state: 'ACCEPTED',
      },
      select: expect.any(Object) as object,
      where: { id: 'friend-a' },
    });
    expect(friendship.direction).toBe('MUTUAL');
    expect(friendship.state).toBe('ACCEPTED');
    expect(friendship.user.username).toBe('builder');
  });

  test('blocks an existing friend relationship as the viewer', async () => {
    const updates: unknown[] = [];
    const service = new UsersService({
      friend: {
        findFirst: () =>
          Promise.resolve({
            acceptedAt: new Date('2026-01-02T00:00:00.000Z'),
            addressee: {
              avatarUrl: null,
              displayName: 'Builder',
              id: 'user-b',
              username: 'builder',
            },
            addresseeId: 'user-b',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'friend-a',
            requester: {
              avatarUrl: null,
              displayName: 'Creator',
              id: 'user-a',
              username: 'creator',
            },
            requesterId: 'user-a',
            state: 'ACCEPTED',
          }),
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({
            acceptedAt: null,
            addressee: {
              avatarUrl: null,
              displayName: 'Builder',
              id: 'user-b',
              username: 'builder',
            },
            addresseeId: 'user-b',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'friend-a',
            requester: {
              avatarUrl: null,
              displayName: 'Creator',
              id: 'user-a',
              username: 'creator',
            },
            requesterId: 'user-a',
            state: 'BLOCKED',
          });
        },
      },
      user: {
        findFirst: () =>
          Promise.resolve({
            avatarUrl: null,
            displayName: 'Builder',
            id: 'user-b',
            username: 'builder',
          }),
      },
    } as unknown as PrismaService);

    const friendship = await service.blockUser('user-a', 'builder');

    expect(updates[0]).toEqual({
      data: {
        acceptedAt: null,
        addresseeId: 'user-b',
        requesterId: 'user-a',
        state: 'BLOCKED',
      },
      select: expect.any(Object) as object,
      where: { id: 'friend-a' },
    });
    expect(friendship.direction).toBe('OUTGOING');
    expect(friendship.state).toBe('BLOCKED');
    expect(friendship.user.username).toBe('builder');
  });
});
