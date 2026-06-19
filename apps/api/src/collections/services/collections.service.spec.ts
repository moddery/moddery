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

  test('normalizes collection slugs before creating collections', async () => {
    const createCalls: unknown[] = [];
    const service = new CollectionsService({
      collection: {
        create: (query: unknown) => {
          createCalls.push(query);
          return Promise.resolve(collectionRow());
        },
      },
    } as unknown as PrismaService);

    await service.createCollection(
      {
        color: null,
        description: null,
        iconUrl: null,
        name: ' Example List ',
        slug: ' Example List! ',
        visibility: 'PUBLIC',
      },
      'user-a',
    );

    expect(createCalls[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Example List',
          slug: 'example-list',
        }),
      }),
    );
  });

  test('rejects invalid collection identity before creating collections', async () => {
    const service = new CollectionsService({
      collection: {
        create: () => {
          throw new Error('Collection create should not run');
        },
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.createCollection(
        {
          color: null,
          description: null,
          iconUrl: null,
          name: ' ',
          slug: 'example',
          visibility: 'PUBLIC',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Collection name is required');
  });

  test('adds projects to collections owned by the current user', async () => {
    const projectLookups: unknown[] = [];
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
        findFirst: (query: unknown) => {
          projectLookups.push(query);
          return Promise.resolve({ id: 'project-a' });
        },
      },
    } as unknown as PrismaService);

    const collection = await service.addProjectToCollection(
      {
        collectionId: 'collection-a',
        projectSlug: 'example',
      },
      'user-a',
    );

    expect(projectLookups[0]).toEqual({
      select: { id: true },
      where: { slug: 'example', status: 'APPROVED' },
    });
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

  test('rejects non-public projects when adding collection items', async () => {
    const service = new CollectionsService({
      collection: {
        findFirst: () => Promise.resolve({ id: 'collection-a' }),
      },
      collectionProject: {
        upsert: () => {
          throw new Error('Collection item should not be created');
        },
      },
      project: {
        findFirst: () => Promise.resolve(null),
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.addProjectToCollection(
        {
          collectionId: 'collection-a',
          projectSlug: 'queued-project',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project not found');
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

  test('rejects invalid collection updates before lookups', async () => {
    const service = new CollectionsService({
      collection: {
        findFirst: () => {
          throw new Error('Collection lookup should not run');
        },
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.updateCollection(
        {
          collectionId: 'collection-a',
          color: null,
          description: null,
          iconUrl: null,
          name: 'Updated',
          slug: '!!',
          visibility: 'PUBLIC',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'Collection slug must be at least 3 characters',
    );
  });

  test('updates collection project ordering for owned collections', async () => {
    const updates: unknown[] = [];
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
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
      project: {
        findUnique: () => Promise.resolve({ id: 'project-a' }),
      },
    } as unknown as PrismaService);

    const collection = await service.updateCollectionProject(
      {
        collectionId: 'collection-a',
        projectSlug: 'example',
        sortOrder: 4,
      },
      'user-a',
    );

    expect(updates[0]).toEqual({
      data: { sortOrder: 4 },
      where: {
        collectionId_projectId: {
          collectionId: 'collection-a',
          projectId: 'project-a',
        },
      },
    });
    expect(collection.id).toBe('collection-a');
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
