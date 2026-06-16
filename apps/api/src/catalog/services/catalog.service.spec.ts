import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { CatalogService } from './catalog.service.js';

describe(CatalogService.name, () => {
  test('searches projects through OpenSearch tags before hydrating rows', async () => {
    const queries: unknown[] = [];
    const searchQueries: unknown[] = [];
    const service = new CatalogService(
      {
        project: {
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([]);
          },
        },
      } as unknown as PrismaService,
      {
        searchProjects: (query: unknown) => {
          searchQueries.push(query);
          return Promise.resolve({ ids: ['project-a'] });
        },
      } as never,
    );

    await service.findProjects({
      loader: 'fabric',
      search: 'sodium',
      tags: ['kind:MOD', 'category:optimization'],
    });

    expect(searchQueries).toEqual([
      {
        search: 'sodium',
        sort: undefined,
        tags: ['kind:MOD', 'category:optimization', 'loader:fabric'],
      },
    ]);
    expect(queries).toHaveLength(1);
    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['project-a'] },
          status: 'APPROVED',
        }),
      }),
    );
  });

  test('loads project team members by project slug', async () => {
    const queries: unknown[] = [];
    const service = new CatalogService(
      {
        project: {
          findUnique: (query: unknown) => {
            queries.push(query);
            return Promise.resolve({
              team: {
                members: [
                  {
                    acceptedAt: new Date('2026-01-01T00:00:00.000Z'),
                    isOwner: true,
                    role: 'Owner',
                    sortOrder: 0,
                    user: {
                      avatarUrl: 'https://example.test/avatar.png',
                      displayName: 'Seed User',
                      id: 'user-a',
                      username: 'seed',
                    },
                  },
                ],
              },
            });
          },
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [] }) } as never,
    );

    const members = await service.findProjectMembers('iris');

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: { slug: 'iris' },
      }),
    );
    expect(members).toEqual([
      {
        accepted: true,
        owner: true,
        role: 'Owner',
        sortOrder: 0,
        user: {
          avatarUrl: 'https://example.test/avatar.png',
          displayName: 'Seed User',
          id: 'user-a',
          username: 'seed',
        },
      },
    ]);
  });

  test('loads viewer project follow state', async () => {
    const service = new CatalogService(
      {
        project: {
          findUnique: () =>
            Promise.resolve({
              followers: 7,
              follows: [{ userId: 'user-a' }],
              slug: 'iris',
            }),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [] }) } as never,
    );

    const state = await service.findViewerProjectFollowState('iris', 'user-a');

    expect(state).toEqual({
      followers: 7,
      following: true,
      projectSlug: 'iris',
    });
  });

  test('follows a project and reconciles follower count', async () => {
    const operations: string[] = [];
    const tx = {
      project: {
        findUniqueOrThrow: () => {
          operations.push('find-project');
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
    const service = new CatalogService(
      {
        $transaction: (callback: (transaction: typeof tx) => unknown) =>
          callback(tx),
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [] }) } as never,
    );

    const state = await service.followProject('iris', 'user-a');

    expect(state).toEqual({
      followers: 8,
      following: true,
      projectSlug: 'iris',
    });
    expect(operations).toEqual([
      'find-project',
      'upsert:{"create":{"projectId":"project-a","userId":"user-a"},"update":{},"where":{"userId_projectId":{"projectId":"project-a","userId":"user-a"}}}',
      'count-follows',
      'update:{"data":{"followers":8},"where":{"id":"project-a"}}',
    ]);
  });
});
