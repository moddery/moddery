import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { UserFriendshipActionsService } from './user-friendship-actions.service.js';
import { UserFriendshipReadsService } from './user-friendship-reads.service.js';
import { UserFriendshipsService } from './user-friendships.service.js';

function createUserFriendshipsService(prisma: PrismaService) {
  return new UserFriendshipsService(
    new UserFriendshipActionsService(prisma),
    new UserFriendshipReadsService(prisma),
  );
}

describe(UserFriendshipsService.name, () => {
  test('loads viewer friends with pagination', async () => {
    const queries: unknown[] = [];
    const service = createUserFriendshipsService({
      friend: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(7);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([friendshipRow()]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findViewerFriends('user-a', {
      limit: 1,
      offset: 2,
    });

    expect(queries[0]).toEqual({
      count: {
        where: {
          OR: [{ requesterId: 'user-a' }, { addresseeId: 'user-a' }],
          state: 'ACCEPTED',
        },
      },
    });
    expect(queries[1]).toMatchObject({
      findMany: {
        orderBy: [{ acceptedAt: 'desc' }, { createdAt: 'desc' }],
        skip: 2,
        take: 1,
        where: {
          OR: [{ requesterId: 'user-a' }, { addresseeId: 'user-a' }],
          state: 'ACCEPTED',
        },
      },
    });
    expect(result.totalHits).toBe(7);
    expect(result.friendships[0]?.direction).toBe('MUTUAL');
    expect(result.friendships[0]?.user.username).toBe('builder');
  });

  test('loads the legacy viewer friend list from friend search results', async () => {
    const queries: unknown[] = [];
    const service = createUserFriendshipsService({
      friend: {
        count: () => Promise.resolve(1),
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([friendshipRow()]);
        },
      },
    } as unknown as PrismaService);

    const friendships = await service.findViewerFriendList('user-a');

    expect(queries[0]).toMatchObject({
      orderBy: [{ acceptedAt: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      where: {
        OR: [{ requesterId: 'user-a' }, { addresseeId: 'user-a' }],
        state: 'ACCEPTED',
      },
    });
    expect(friendships[0]?.user.username).toBe('builder');
  });

  test('loads viewer friend requests with pagination', async () => {
    const queries: unknown[] = [];
    const service = createUserFriendshipsService({
      friend: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(3);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([
            friendshipRow({
              addresseeId: 'user-a',
              requesterId: 'user-b',
              state: 'PENDING',
            }),
          ]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findViewerFriendRequests('user-a', {
      limit: 5,
      offset: 10,
    });

    expect(queries[0]).toEqual({
      count: {
        where: {
          OR: [{ requesterId: 'user-a' }, { addresseeId: 'user-a' }],
          state: 'PENDING',
        },
      },
    });
    expect(queries[1]).toMatchObject({
      findMany: {
        orderBy: [{ createdAt: 'desc' }],
        skip: 10,
        take: 5,
        where: {
          OR: [{ requesterId: 'user-a' }, { addresseeId: 'user-a' }],
          state: 'PENDING',
        },
      },
    });
    expect(result.totalHits).toBe(3);
    expect(result.friendships[0]?.direction).toBe('INCOMING');
  });

  test('loads viewer blocked users with pagination', async () => {
    const queries: unknown[] = [];
    const service = createUserFriendshipsService({
      friend: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(2);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([
            friendshipRow({
              acceptedAt: null,
              state: 'BLOCKED',
            }),
          ]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findViewerBlockedUsers('user-a', {
      limit: 4,
      offset: 8,
    });

    expect(queries[0]).toEqual({
      count: {
        where: {
          requesterId: 'user-a',
          state: 'BLOCKED',
        },
      },
    });
    expect(queries[1]).toMatchObject({
      findMany: {
        orderBy: [{ updatedAt: 'desc' }],
        skip: 8,
        take: 4,
        where: {
          requesterId: 'user-a',
          state: 'BLOCKED',
        },
      },
    });
    expect(result.totalHits).toBe(2);
    expect(result.friendships[0]?.direction).toBe('OUTGOING');
  });

  test('accepts an incoming friend request when sending one back', async () => {
    const updates: unknown[] = [];
    const service = createUserFriendshipsService({
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
    const service = createUserFriendshipsService({
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

function friendshipRow({
  acceptedAt = new Date('2026-01-02T00:00:00.000Z'),
  addresseeId = 'user-b',
  id = 'friend-a',
  requesterId = 'user-a',
  state = 'ACCEPTED',
}: {
  acceptedAt?: Date | null;
  addresseeId?: string;
  id?: string;
  requesterId?: string;
  state?: 'ACCEPTED' | 'BLOCKED' | 'PENDING';
} = {}) {
  return {
    acceptedAt,
    addressee: {
      avatarUrl: null,
      displayName: 'Builder',
      id: addresseeId,
      username: 'builder',
    },
    addresseeId,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id,
    requester: {
      avatarUrl: null,
      displayName: 'Creator',
      id: requesterId,
      username: 'creator',
    },
    requesterId,
    state,
  };
}
