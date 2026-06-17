import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { CollectionsService } from './collections.service.js';

describe(CollectionsService.name, () => {
  test('creates owned collections with trimmed optional fields', async () => {
    const createCalls: unknown[] = [];
    const service = new CollectionsService({
      collection: {
        create: (query: unknown) => {
          createCalls.push(query);
          return Promise.resolve(collectionRow());
        },
      },
    } as unknown as PrismaService);

    const collection = await service.createCollection(
      {
        color: ' #1d9bf0 ',
        description: '  Example list  ',
        iconUrl: ' https://cdn.example.test/collection.png ',
        name: 'Example',
        slug: 'example',
        visibility: 'PUBLIC',
      },
      'user-a',
    );

    expect(createCalls[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          color: '#1d9bf0',
          description: 'Example list',
          iconUrl: 'https://cdn.example.test/collection.png',
          name: 'Example',
          ownerId: 'user-a',
          slug: 'example',
          visibility: 'PUBLIC',
        }),
      }),
    );
    expect(collection.projectCount).toBe(1);
  });

  test('adds projects to collections owned by the current user', async () => {
    const upserts: unknown[] = [];
    const service = new CollectionsService({
      collection: {
        findFirst: (query: { select?: unknown; where?: { id?: string } }) => {
          if (query.where?.id === 'collection-a') {
            return Promise.resolve(
              query.select === undefined
                ? { id: 'collection-a' }
                : collectionRow(),
            );
          }

          return Promise.resolve(null);
        },
      },
      collectionProject: {
        count: () => Promise.resolve(3),
        upsert: (query: unknown) => {
          upserts.push(query);
          return Promise.resolve({});
        },
      },
      project: {
        findUnique: () => Promise.resolve({ id: 'project-a' }),
      },
    } as unknown as PrismaService);

    const collection = await service.addProjectToCollection(
      {
        collectionId: 'collection-a',
        projectSlug: 'example',
      },
      'user-a',
    );

    expect(upserts[0]).toEqual(
      expect.objectContaining({
        create: expect.objectContaining({
          addedById: 'user-a',
          collectionId: 'collection-a',
          projectId: 'project-a',
          sortOrder: 3,
        }),
      }),
    );
    expect(collection.id).toBe('collection-a');
  });

  test('loads public or unlisted collection details by owner username and slug', async () => {
    const queries: unknown[] = [];
    const service = new CollectionsService({
      collection: {
        findFirst: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(collectionRow());
        },
      },
    } as unknown as PrismaService);

    const collection = await service.findPublicCollectionBySlug(
      'Creator',
      'example',
    );

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: {
          owner: {
            username: {
              equals: 'Creator',
              mode: 'insensitive',
            },
          },
          slug: 'example',
          visibility: { in: ['PUBLIC', 'UNLISTED'] },
        },
      }),
    );
    expect(collection.projects).toHaveLength(1);
    expect(collection.projects[0]?.owner?.username).toBe('creator');
    expect(collection.projects[0]?.organization?.slug).toBe('example-org');
    expect(collection.items[0]?.addedBy?.username).toBe('creator');
    expect(collection.items[0]?.sortOrder).toBe(0);
  });

  test('loads public collection items with pagination', async () => {
    const queries: unknown[] = [];
    const service = new CollectionsService({
      collection: {
        findFirst: (query: unknown) => {
          queries.push({ collection: query });
          return Promise.resolve({ id: 'collection-a' });
        },
      },
      collectionProject: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(13);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve(collectionRow().projects);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findPublicCollectionItems(
      'Creator',
      'example',
      {
        limit: 8,
        offset: 8,
      },
    );

    expect(queries[0]).toEqual({
      collection: {
        select: { id: true },
        where: {
          owner: {
            username: {
              equals: 'Creator',
              mode: 'insensitive',
            },
          },
          slug: 'example',
          visibility: { in: ['PUBLIC', 'UNLISTED'] },
        },
      },
    });
    expect(queries[1]).toEqual({
      count: { where: { collectionId: 'collection-a' } },
    });
    expect(queries[2]).toMatchObject({
      findMany: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: 8,
        take: 8,
        where: { collectionId: 'collection-a' },
      },
    });
    expect(result.totalHits).toBe(13);
    expect(result.items[0]?.project.slug).toBe('example');
  });

  test('filters public collections by search text', async () => {
    const queries: unknown[] = [];
    const service = new CollectionsService({
      collection: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(7);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([collectionRow()]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findPublicCollections({
      limit: 12,
      offset: 24,
      search: ' creator ',
    });

    expect(queries[0]).toMatchObject({
      count: {
        where: {
          OR: expect.arrayContaining([
            {
              name: {
                contains: 'creator',
                mode: 'insensitive',
              },
            },
            {
              owner: {
                is: {
                  OR: expect.arrayContaining([
                    {
                      username: {
                        contains: 'creator',
                        mode: 'insensitive',
                      },
                    },
                  ]),
                },
              },
            },
          ]) as unknown[],
          visibility: 'PUBLIC',
        },
      },
    });
    expect(queries[1]).toMatchObject({
      findMany: {
        skip: 24,
        take: 12,
      },
    });
    expect(result.totalHits).toBe(7);
    expect(result.collections[0]?.name).toBe('Example');
  });

  test('loads the legacy public collection list from search results', async () => {
    const queries: unknown[] = [];
    const service = new CollectionsService({
      collection: {
        count: () => Promise.resolve(1),
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([collectionRow()]);
        },
      },
    } as unknown as PrismaService);

    const collections = await service.findPublicCollectionList();

    expect(queries[0]).toMatchObject({
      take: 50,
      where: { visibility: 'PUBLIC' },
    });
    expect(collections[0]?.name).toBe('Example');
  });

  test('removes projects from collections owned by the current user', async () => {
    const deletes: unknown[] = [];
    const service = new CollectionsService({
      collection: {
        findFirst: (query: { select?: unknown; where?: { id?: string } }) => {
          if (query.where?.id === 'collection-a') {
            return Promise.resolve(
              query.select === undefined
                ? { id: 'collection-a' }
                : collectionRow(),
            );
          }

          return Promise.resolve(null);
        },
      },
      collectionProject: {
        delete: (query: unknown) => {
          deletes.push(query);
          return Promise.resolve({});
        },
      },
      project: {
        findUnique: () => Promise.resolve({ id: 'project-a' }),
      },
    } as unknown as PrismaService);

    const collection = await service.removeProjectFromCollection(
      {
        collectionId: 'collection-a',
        projectSlug: 'example',
      },
      'user-a',
    );

    expect(deletes[0]).toEqual({
      where: {
        collectionId_projectId: {
          collectionId: 'collection-a',
          projectId: 'project-a',
        },
      },
    });
    expect(collection.id).toBe('collection-a');
  });

  test('updates owned collection metadata', async () => {
    const updates: unknown[] = [];
    const service = new CollectionsService({
      collection: {
        findFirst: (query: { select?: unknown; where?: { id?: string } }) => {
          if (query.where?.id === 'collection-a') {
            return Promise.resolve(
              query.select === undefined
                ? { id: 'collection-a' }
                : collectionRow({ name: 'Updated' }),
            );
          }

          return Promise.resolve(null);
        },
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const collection = await service.updateCollection(
      {
        collectionId: 'collection-a',
        color: '  ',
        description: ' Updated description ',
        iconUrl: '  ',
        name: ' Updated ',
        slug: 'updated',
        visibility: 'UNLISTED',
      },
      'user-a',
    );

    expect(updates[0]).toEqual({
      data: {
        color: null,
        description: 'Updated description',
        iconUrl: null,
        name: 'Updated',
        slug: 'updated',
        visibility: 'UNLISTED',
      },
      where: { id: 'collection-a' },
    });
    expect(collection.name).toBe('Updated');
  });
});

function collectionRow(overrides: Partial<{ name: string }> = {}) {
  return {
    _count: { projects: 1 },
    color: '#1d9bf0',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    description: 'Example list',
    iconUrl: null,
    id: 'collection-a',
    name: overrides.name ?? 'Example',
    owner: {
      avatarUrl: null,
      displayName: null,
      id: 'user-a',
      username: 'creator',
    },
    projects: [
      {
        addedBy: {
          avatarUrl: null,
          displayName: null,
          id: 'user-a',
          username: 'creator',
        },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        project: {
          categories: [{ category: { slug: 'utility' } }],
          description: 'Body',
          discordUrl: null,
          downloads: 10,
          followers: 2,
          gallery: [],
          gameVersions: [{ gameVersion: { version: '1.21.6' } }],
          iconUrl: null,
          id: 'project-a',
          issuesUrl: null,
          kind: 'MOD',
          license: { key: 'mit', name: 'MIT', url: null },
          links: [],
          loaders: [{ loader: 'FABRIC' }],
          organization: {
            color: '#1d9bf0',
            iconUrl: null,
            id: 'organization-a',
            name: 'Example Org',
            slug: 'example-org',
          },
          publishedAt: new Date('2025-12-15T00:00:00.000Z'),
          sourceUrl: null,
          team: {
            members: [
              {
                user: {
                  avatarUrl: null,
                  displayName: null,
                  id: 'user-a',
                  username: 'creator',
                },
              },
            ],
          },
          slug: 'example',
          status: 'APPROVED',
          summary: 'Summary',
          title: 'Example',
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
          wikiUrl: null,
        },
        sortOrder: 0,
      },
    ],
    slug: 'example',
    updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    visibility: 'PUBLIC',
  };
}
