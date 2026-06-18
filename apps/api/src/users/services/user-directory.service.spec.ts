import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { UserDirectoryService } from './user-directory.service.js';

describe(UserDirectoryService.name, () => {
  test('loads active public users without private account fields', async () => {
    const queries: unknown[] = [];
    const service = new UserDirectoryService({
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
    const service = new UserDirectoryService({
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
    const service = new UserDirectoryService({
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
    const service = new UserDirectoryService({
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
    const service = new UserDirectoryService({
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
});

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
