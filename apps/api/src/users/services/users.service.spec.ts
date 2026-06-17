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

  test('loads admin users with pagination and private fields', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
      user: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(4);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([userProfileRow()]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findAdminUsers({
      limit: 10,
      offset: 20,
      search: ' moderator ',
    });

    expect(queries[0]).toEqual({
      count: {
        where: {
          OR: [
            { username: { contains: 'moderator', mode: 'insensitive' } },
            { displayName: { contains: 'moderator', mode: 'insensitive' } },
            { email: { contains: 'moderator', mode: 'insensitive' } },
            { role: 'MODERATOR' },
          ],
        },
      },
    });
    expect(queries[1]).toMatchObject({
      findMany: {
        orderBy: [{ createdAt: 'desc' }],
        skip: 20,
        take: 10,
        where: {
          OR: [
            { username: { contains: 'moderator', mode: 'insensitive' } },
            { displayName: { contains: 'moderator', mode: 'insensitive' } },
            { email: { contains: 'moderator', mode: 'insensitive' } },
            { role: 'MODERATOR' },
          ],
        },
      },
    });
    expect(result.totalHits).toBe(4);
    expect(result.users[0]).toMatchObject({
      email: 'creator@example.test',
      newsletterOptIn: true,
      role: 'USER',
      status: 'ACTIVE',
      username: 'creator',
    });
  });

  test('loads the legacy admin user list from admin search results', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
      user: {
        count: () => Promise.resolve(1),
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([userProfileRow()]);
        },
      },
    } as unknown as PrismaService);

    const users = await service.findAdminUserList();

    expect(queries[0]).toMatchObject({
      orderBy: [{ createdAt: 'desc' }],
      skip: 0,
      take: 50,
      where: {},
    });
    expect(users[0]?.username).toBe('creator');
  });

  test('loads active public users without private account fields', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
      user: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(12);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
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

    const result = await service.findPublicUsers({
      limit: 20,
      offset: 40,
    });

    expect(queries[0]).toEqual({ count: { where: { status: 'ACTIVE' } } });
    expect(queries[1]).toMatchObject({
      findMany: {
        orderBy: [{ createdAt: 'desc' }],
        skip: 40,
        take: 20,
        where: { status: 'ACTIVE' },
      },
    });
    expect(result.totalHits).toBe(12);
    expect(result.users[0]).toMatchObject({
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

  test('loads the legacy public user list from public search results', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
      user: {
        count: () => Promise.resolve(1),
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
              bio: null,
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

    const users = await service.findPublicUserList();

    expect(queries[0]).toMatchObject({
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
      where: { status: 'ACTIVE' },
    });
    expect(users[0]).toMatchObject({
      bio: null,
      collectionCount: 0,
      email: null,
      emailVerifiedAt: null,
      followedProjectCount: 0,
      friendCount: 0,
      newsletterOptIn: false,
      projectCount: 0,
      twoFactorEnabled: false,
      username: 'creator',
    });
  });

  test('filters public users by search text', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
      user: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(1);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
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

    const result = await service.findPublicUsers({ search: ' utility ' });

    expect(queries[0]).toMatchObject({
      count: {
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
      },
    });
    const findManyQuery = queries[1] as {
      findMany: { skip: number; take: number; where: Record<string, unknown> };
    };
    expect(findManyQuery.findMany.skip).toBe(0);
    expect(findManyQuery.findMany.take).toBe(50);
    expect(result.users[0]?.username).toBe('creator');
  });

  test('loads public user projects with pagination', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
      teamMember: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(9);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([{ team: { project: userProjectRow() } }]);
        },
      },
      user: {
        findFirst: (query: unknown) => {
          queries.push({ user: query });
          return Promise.resolve({ id: 'user-a' });
        },
      },
    } as unknown as PrismaService);

    const result = await service.findPublicUserProjects('Creator', {
      limit: 6,
      offset: 12,
    });

    expect(queries[0]).toEqual({
      user: {
        select: { id: true },
        where: {
          status: 'ACTIVE',
          username: { equals: 'Creator', mode: 'insensitive' },
        },
      },
    });
    expect(queries[1]).toEqual({
      count: {
        where: {
          acceptedAt: { not: null },
          team: { project: { is: { status: 'APPROVED' } } },
          userId: 'user-a',
        },
      },
    });
    expect(queries[2]).toMatchObject({
      findMany: {
        orderBy: [
          { isOwner: 'desc' },
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: 12,
        take: 6,
        where: {
          acceptedAt: { not: null },
          team: { project: { is: { status: 'APPROVED' } } },
          userId: 'user-a',
        },
      },
    });
    expect(result.totalHits).toBe(9);
    expect(result.projects[0]?.slug).toBe('useful-project');
  });

  test('loads public user collections with pagination', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
      collection: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(5);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([userCollectionRow()]);
        },
      },
      user: {
        findFirst: (query: unknown) => {
          queries.push({ user: query });
          return Promise.resolve({ id: 'user-a' });
        },
      },
    } as unknown as PrismaService);

    const result = await service.findPublicUserCollections('Creator', {
      limit: 3,
      offset: 6,
    });

    expect(queries[0]).toEqual({
      user: {
        select: { id: true },
        where: {
          status: 'ACTIVE',
          username: { equals: 'Creator', mode: 'insensitive' },
        },
      },
    });
    expect(queries[1]).toEqual({
      count: {
        where: {
          ownerId: 'user-a',
          visibility: 'PUBLIC',
        },
      },
    });
    expect(queries[2]).toMatchObject({
      findMany: {
        orderBy: [{ updatedAt: 'desc' }],
        skip: 6,
        take: 3,
        where: {
          ownerId: 'user-a',
          visibility: 'PUBLIC',
        },
      },
    });
    expect(result.totalHits).toBe(5);
    expect(result.collections[0]?.slug).toBe('starter-list');
    expect(result.collections[0]?.projects[0]?.slug).toBe('useful-project');
  });

  test('loads viewer friends with pagination', async () => {
    const queries: unknown[] = [];
    const service = new UsersService({
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
    const service = new UsersService({
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
    const service = new UsersService({
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
    const service = new UsersService({
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

function userProfileRow() {
  return {
    _count: {
      collections: 0,
      projectFollows: 0,
      teamMemberships: 0,
    },
    avatarUrl: null,
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
  };
}

function userCollectionRow() {
  return {
    _count: {
      projects: 1,
    },
    color: '#1d9bf0',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    description: 'A useful starter list.',
    iconUrl: null,
    id: 'collection-a',
    name: 'Starter list',
    owner: {
      avatarUrl: null,
      displayName: 'Creator',
      id: 'user-a',
      username: 'creator',
    },
    projects: [
      {
        addedBy: {
          avatarUrl: null,
          displayName: 'Creator',
          id: 'user-a',
          username: 'creator',
        },
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        project: userProjectRow(),
        sortOrder: 0,
      },
    ],
    slug: 'starter-list',
    updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    visibility: 'PUBLIC',
  };
}

function userProjectRow() {
  return {
    approvedAt: new Date('2026-01-01T00:00:00.000Z'),
    archivedAt: null,
    categories: [{ category: { slug: 'utility' } }],
    color: '#1d9bf0',
    description: 'Long project description.',
    discordUrl: null,
    downloads: 120,
    followers: 12,
    gallery: [],
    gameVersions: [{ gameVersion: { version: '1.21.6' } }],
    iconUrl: null,
    id: 'project-a',
    issuesUrl: null,
    kind: 'MOD',
    license: { key: 'MIT', name: 'MIT', url: null },
    links: [],
    loaders: [{ loader: 'FABRIC' }],
    organization: null,
    publishedAt: new Date('2026-01-01T00:00:00.000Z'),
    queuedAt: null,
    requestedStatus: null,
    slug: 'useful-project',
    sourceUrl: null,
    status: 'APPROVED',
    summary: 'Useful project summary.',
    team: {
      members: [
        {
          user: {
            avatarUrl: null,
            displayName: 'Creator',
            id: 'user-a',
            username: 'creator',
          },
        },
      ],
    },
    title: 'Useful Project',
    updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    wikiUrl: null,
  };
}
