import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { UserAdminService } from './user-admin.service.js';

describe(UserAdminService.name, () => {
  test('updates user account role and status for admins', async () => {
    const updates: unknown[] = [];
    const service = new UserAdminService({
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
    const service = new UserAdminService({
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
    const service = new UserAdminService({
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
});

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
