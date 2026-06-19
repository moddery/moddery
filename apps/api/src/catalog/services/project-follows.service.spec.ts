import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ProjectFollowsService } from './project-follows.service.js';

function fakeRedis() {
  const cache = new Map<string, unknown>();
  const deletedKeys: string[] = [];

  return {
    cache,
    deletedKeys,
    redis: {
      delete: (key: string) => {
        cache.delete(key);
        deletedKeys.push(key);
        return Promise.resolve();
      },
    },
  };
}

function fakeSearch() {
  const followerUpdates: { followers: number; projectId: string }[] = [];

  return {
    followerUpdates,
    search: {
      updateProjectFollowers: (projectId: string, followers: number) => {
        followerUpdates.push({ followers, projectId });
        return Promise.resolve();
      },
    },
  };
}

describe(ProjectFollowsService.name, () => {
  test('loads viewer project follow state for approved projects', async () => {
    const queries: unknown[] = [];
    const service = new ProjectFollowsService(
      {
        project: {
          findFirst: (query: unknown) => {
            queries.push(query);
            return Promise.resolve({
              followers: 7,
              follows: [{ userId: 'user-a' }],
              slug: 'iris',
            });
          },
        },
      } as unknown as PrismaService,
      fakeRedis().redis as never,
      fakeSearch().search as never,
    );

    const state = await service.findViewerProjectFollowState('iris', 'user-a');

    expect(queries[0]).toEqual({
      select: {
        followers: true,
        follows: {
          select: { userId: true },
          take: 1,
          where: { userId: 'user-a' },
        },
        slug: true,
      },
      where: { slug: 'iris', status: 'APPROVED' },
    });
    expect(state).toEqual({
      followers: 7,
      following: true,
      projectSlug: 'iris',
    });
  });

  test('does not load follow state for non-public projects', async () => {
    const service = new ProjectFollowsService(
      {
        project: {
          findFirst: () => Promise.resolve(null),
        },
      } as unknown as PrismaService,
      fakeRedis().redis as never,
      fakeSearch().search as never,
    );

    const state = await service.findViewerProjectFollowState(
      'queued-project',
      'user-a',
    );

    expect(state).toBeUndefined();
  });

  test('follows approved projects, reconciles follower count, and invalidates cache', async () => {
    const operations: string[] = [];
    const redis = fakeRedis();
    const search = fakeSearch();
    const tx = {
      project: {
        findFirst: (query: unknown) => {
          operations.push(`find-project:${JSON.stringify(query)}`);
          return Promise.resolve({ id: 'project-a', slug: 'iris' });
        },
        update: (query: unknown) => {
          operations.push(`update:${JSON.stringify(query)}`);
          return Promise.resolve();
        },
      },
      projectFollow: {
        count: () => {
          operations.push('count-follows');
          return Promise.resolve(8);
        },
        upsert: (query: unknown) => {
          operations.push(`upsert:${JSON.stringify(query)}`);
          return Promise.resolve();
        },
      },
    };
    const service = new ProjectFollowsService(
      {
        $transaction: (callback: (transaction: typeof tx) => unknown) =>
          callback(tx),
      } as unknown as PrismaService,
      redis.redis as never,
      search.search as never,
    );

    redis.cache.set('catalog:project-by-slug:iris', { slug: 'iris' });
    const state = await service.followProject('iris', 'user-a');

    expect(state).toEqual({
      followers: 8,
      following: true,
      projectSlug: 'iris',
    });
    expect(operations).toEqual([
      'find-project:{"select":{"id":true,"slug":true},"where":{"slug":"iris","status":"APPROVED"}}',
      'upsert:{"create":{"projectId":"project-a","userId":"user-a"},"update":{},"where":{"userId_projectId":{"projectId":"project-a","userId":"user-a"}}}',
      'count-follows',
      'update:{"data":{"followers":8},"where":{"id":"project-a"}}',
    ]);
    expect(redis.deletedKeys).toEqual(['catalog:project-by-slug:iris']);
    expect(redis.cache.has('catalog:project-by-slug:iris')).toBe(false);
    expect(search.followerUpdates).toEqual([
      { followers: 8, projectId: 'project-a' },
    ]);
  });

  test('rejects following non-public projects', async () => {
    const service = new ProjectFollowsService(
      {
        $transaction: (callback: (transaction: unknown) => unknown) =>
          callback({
            project: {
              findFirst: () => Promise.resolve(null),
            },
            projectFollow: {
              upsert: () => {
                throw new Error('Follow should not be created');
              },
            },
          }),
      } as unknown as PrismaService,
      fakeRedis().redis as never,
      fakeSearch().search as never,
    );

    let caught: unknown;
    try {
      await service.followProject('queued-project', 'user-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project not found');
  });

  test('unfollows approved projects, reconciles follower count, and invalidates cache', async () => {
    const operations: string[] = [];
    const redis = fakeRedis();
    const search = fakeSearch();
    const tx = {
      project: {
        findFirst: () => Promise.resolve({ id: 'project-a', slug: 'iris' }),
        update: (query: unknown) => {
          operations.push(`update:${JSON.stringify(query)}`);
          return Promise.resolve();
        },
      },
      projectFollow: {
        count: () => {
          operations.push('count-follows');
          return Promise.resolve(6);
        },
        deleteMany: (query: unknown) => {
          operations.push(`delete:${JSON.stringify(query)}`);
          return Promise.resolve();
        },
      },
    };
    const service = new ProjectFollowsService(
      {
        $transaction: (callback: (transaction: typeof tx) => unknown) =>
          callback(tx),
      } as unknown as PrismaService,
      redis.redis as never,
      search.search as never,
    );

    const state = await service.unfollowProject('iris', 'user-a');

    expect(state).toEqual({
      followers: 6,
      following: false,
      projectSlug: 'iris',
    });
    expect(operations).toEqual([
      'delete:{"where":{"projectId":"project-a","userId":"user-a"}}',
      'count-follows',
      'update:{"data":{"followers":6},"where":{"id":"project-a"}}',
    ]);
    expect(redis.deletedKeys).toEqual(['catalog:project-by-slug:iris']);
    expect(search.followerUpdates).toEqual([
      { followers: 6, projectId: 'project-a' },
    ]);
  });

  test('rejects unfollowing non-public projects', async () => {
    const service = new ProjectFollowsService(
      {
        $transaction: (callback: (transaction: unknown) => unknown) =>
          callback({
            project: {
              findFirst: () => Promise.resolve(null),
            },
            projectFollow: {
              deleteMany: () => {
                throw new Error('Follow should not be deleted');
              },
            },
          }),
      } as unknown as PrismaService,
      fakeRedis().redis as never,
      fakeSearch().search as never,
    );

    let caught: unknown;
    try {
      await service.unfollowProject('queued-project', 'user-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project not found');
  });

  test('loads viewer followed projects newest first', async () => {
    const queries: unknown[] = [];
    const service = new ProjectFollowsService(
      {
        projectFollow: {
          count: (query: unknown) => {
            queries.push(query);
            return Promise.resolve(9);
          },
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([
              { project: projectRow({ title: 'Followed Project' }) },
            ]);
          },
        },
      } as unknown as PrismaService,
      fakeRedis().redis as never,
      fakeSearch().search as never,
    );

    const result = await service.findViewerFollowedProjects('user-a', {
      limit: 12,
      offset: 24,
    });

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: {
          project: { status: 'APPROVED' },
          userId: 'user-a',
        },
      }),
    );
    expect(queries[1]).toEqual(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        skip: 24,
        take: 12,
        where: {
          project: { status: 'APPROVED' },
          userId: 'user-a',
        },
      }),
    );
    expect(result.totalHits).toBe(9);
    expect(result.projects[0]?.title).toBe('Followed Project');
  });

  test('loads the legacy viewer followed project list from search results', async () => {
    const queries: unknown[] = [];
    const service = new ProjectFollowsService(
      {
        projectFollow: {
          count: (query: unknown) => {
            queries.push(query);
            return Promise.resolve(1);
          },
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([
              { project: projectRow({ title: 'Followed Project' }) },
            ]);
          },
        },
      } as unknown as PrismaService,
      fakeRedis().redis as never,
      fakeSearch().search as never,
    );

    const projects = await service.findViewerFollowedProjectList('user-a');

    expect(queries[1]).toEqual(
      expect.objectContaining({
        skip: 0,
        take: 50,
        where: {
          project: { status: 'APPROVED' },
          userId: 'user-a',
        },
      }),
    );
    expect(projects[0]?.title).toBe('Followed Project');
  });
});

function projectRow({
  gallery = [],
  license = { key: 'mit', name: 'MIT', url: null },
  links = [],
  moderationLock = null,
  status = 'APPROVED',
  title,
}: {
  gallery?: {
    createdAt: Date;
    description: string | null;
    displayUrl: string;
    featured: boolean;
    rawUrl: string;
    sortOrder: number;
    title: string | null;
  }[];
  license?: { key: string; name: string; url: string | null };
  links?: { kind: string; label: string | null; url: string }[];
  moderationLock?: {
    createdAt: Date;
    expiresAt: Date;
    id: string;
    moderator: {
      displayName: string | null;
      id: string;
      username: string;
    };
  } | null;
  status?: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED' | 'ARCHIVED';
  title: string;
}) {
  return {
    approvedAt:
      status === 'APPROVED' ? new Date('2026-01-01T00:00:00.000Z') : null,
    archivedAt:
      status === 'ARCHIVED' ? new Date('2026-01-01T00:00:00.000Z') : null,
    categories: [{ category: { slug: 'utility' } }],
    color: '#f97316',
    description: 'Updated body',
    discordUrl: null,
    downloads: 10,
    followers: 2,
    gallery,
    gameVersions: [{ gameVersion: { version: '1.21.6' } }],
    iconUrl: 'https://example.test/icon.png',
    id: 'project-a',
    issuesUrl: null,
    kind: 'MOD',
    license,
    links,
    loaders: [{ loader: 'FABRIC' }],
    moderationLock,
    organization: {
      color: '#1d9bf0',
      iconUrl: 'https://example.test/org.png',
      id: 'organization-a',
      name: 'Example Org',
      slug: 'example-org',
    },
    publishedAt: new Date('2025-12-15T00:00:00.000Z'),
    queuedAt:
      status === 'PENDING_REVIEW' ? new Date('2026-01-01T00:00:00.000Z') : null,
    requestedStatus: null,
    slug: 'example',
    sourceUrl: 'https://example.test/source',
    status,
    summary: 'Updated summary',
    team: {
      members: [
        {
          user: {
            avatarUrl: null,
            displayName: 'Project Creator',
            id: 'user-owner',
            username: 'creator',
          },
        },
      ],
    },
    title,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    wikiUrl: null,
  };
}
