import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { CatalogService } from './catalog.service.js';

function createCatalogService(prisma: PrismaService, searchService: unknown) {
  return new CatalogService(prisma, searchService as never, fakeRedis());
}

function fakeRedis() {
  return fakeRedisState().redis as never;
}

function fakeRedisState() {
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
      getJson: <TValue>(key: string) =>
        Promise.resolve(cache.get(key) as TValue),
      setJson: (key: string, value: unknown) => {
        cache.set(key, value);
        return Promise.resolve();
      },
    },
  };
}

describe(CatalogService.name, () => {
  test('caches projects looked up by slug', async () => {
    let lookups = 0;
    const service = createCatalogService(
      {
        project: {
          findUnique: () => {
            lookups += 1;
            return Promise.resolve(projectRow({ title: 'Cached Project' }));
          },
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) },
    );

    const first = await service.findProjectBySlug('example');
    const second = await service.findProjectBySlug('example');

    expect(lookups).toBe(1);
    expect(first?.title).toBe('Cached Project');
    expect(second?.title).toBe('Cached Project');
  });

  test('does not return non-approved projects from public slug lookup', async () => {
    const redisState = fakeRedisState();
    redisState.cache.set('catalog:project-by-slug:example', {
      status: 'PENDING_REVIEW',
      title: 'Private Project',
    });
    const queries: unknown[] = [];
    const service = new CatalogService(
      {
        project: {
          findUnique: (query: unknown) => {
            queries.push(query);
            return Promise.resolve(null);
          },
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
      redisState.redis as never,
    );

    const project = await service.findProjectBySlug('example');

    expect(project).toBeUndefined();
    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: { slug: 'example', status: 'APPROVED' },
      }),
    );
  });

  test('searches projects through OpenSearch tags before hydrating rows', async () => {
    const queries: unknown[] = [];
    const searchQueries: unknown[] = [];
    const service = createCatalogService(
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
          return Promise.resolve({ ids: ['project-a'], total: 14 });
        },
      },
    );

    const result = await service.searchProjects({
      limit: 25,
      loader: 'fabric',
      offset: 50,
      search: 'sodium',
      tags: ['kind:MOD', 'category:optimization'],
    });

    expect(searchQueries).toEqual([
      {
        limit: 25,
        offset: 50,
        search: 'sodium',
        sort: undefined,
        tags: ['kind:MOD', 'category:optimization', 'loader:fabric'],
      },
    ]);
    expect(result).toEqual({ projects: [], totalHits: 14 });
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
    id: string;
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
