import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { VersionDirectoryService } from './version-directory.service.js';

describe(VersionDirectoryService.name, () => {
  test('loads approved project versions with files and metadata', async () => {
    const queries: unknown[] = [];
    const service = new VersionDirectoryService({
      version: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(1);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([
            versionRow({
              changelog: 'Release notes',
              downloads: 42,
              files: [
                {
                  fileName: 'example.jar',
                  hashes: [{ algorithm: 'SHA512', value: 'def456' }],
                  id: 'file-a',
                  isPrimary: true,
                  scans: [
                    {
                      createdAt: new Date('2026-01-02T00:00:00.000Z'),
                      details: { signal: 'clean' },
                      id: 'scan-a',
                      status: 'COMPLETE',
                      verdict: 'CLEAN',
                    },
                  ],
                  sizeBytes: 1234n,
                  kind: 'UNIVERSAL',
                  url: 'https://example.test/example.jar',
                },
              ],
              name: 'Example 1.0.0',
            }),
          ]);
        },
      },
    } as unknown as PrismaService);

    const versions = await service.findByProjectSlug('example');

    expect(queries[0]).toEqual(
      expect.objectContaining({
        count: {
          where: {
            project: { slug: 'example' },
            status: 'APPROVED',
          },
        },
      }),
    );
    expect(queries[1]).toEqual(
      expect.objectContaining({
        findMany: expect.objectContaining({
          skip: 0,
          take: 100,
          where: {
            project: { slug: 'example' },
            status: 'APPROVED',
          },
        }),
      }),
    );
    expect(versions).toEqual([
      {
        author: {
          avatarUrl: null,
          displayName: 'Release Author',
          id: 'user-a',
          username: 'author',
        },
        changelog: 'Release notes',
        channel: 'RELEASE',
        createdAt: new Date('2025-12-31T00:00:00.000Z'),
        datePublished: new Date('2026-01-01T00:00:00.000Z'),
        downloads: 42,
        dependencies: [],
        featured: true,
        files: [
          {
            fileName: 'example.jar',
            hashes: [{ algorithm: 'SHA512', value: 'def456' }],
            id: 'file-a',
            kind: 'UNIVERSAL',
            primary: true,
            scans: [
              {
                createdAt: new Date('2026-01-02T00:00:00.000Z'),
                details: '{\n  "signal": "clean"\n}',
                id: 'scan-a',
                status: 'COMPLETE',
                verdict: 'CLEAN',
              },
            ],
            sizeBytes: '1234',
            url: 'https://example.test/example.jar',
          },
        ],
        gameVersions: ['1.21.6'],
        id: 'version-a',
        loaders: ['fabric'],
        name: 'Example 1.0.0',
        projectSlug: 'example',
        requestedStatus: null,
        sortOrder: 7,
        status: 'APPROVED',
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
        versionNumber: '1.0.0',
      },
    ]);
  });

  test('searches project versions with filters and pagination', async () => {
    const queries: unknown[] = [];
    const service = new VersionDirectoryService({
      version: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(12);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([
            versionRow({
              name: 'Fabric 1.21.6',
              versionNumber: '2.0.0',
            }),
          ]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.searchByProjectSlug('example', {
      gameVersion: '1.21.6',
      limit: 10,
      loader: 'fabric',
      offset: 20,
      search: '2.0',
    });

    const where = {
      gameVersions: {
        some: {
          gameVersion: { version: '1.21.6' },
        },
      },
      loaders: {
        some: { loader: 'FABRIC' },
      },
      OR: [
        {
          name: {
            contains: '2.0',
            mode: 'insensitive',
          },
        },
        {
          versionNumber: {
            contains: '2.0',
            mode: 'insensitive',
          },
        },
      ],
      project: { slug: 'example' },
      status: 'APPROVED',
    };

    expect(queries[0]).toEqual({ count: { where } });
    expect(queries[1]).toEqual(
      expect.objectContaining({
        findMany: expect.objectContaining({
          skip: 20,
          take: 10,
          where,
        }),
      }),
    );
    expect(result.totalHits).toBe(12);
    expect(result.versions[0]?.versionNumber).toBe('2.0.0');
  });
});

function versionRow(
  overrides: Partial<{
    changelog: string | null;
    channel: string;
    dependencies: {
      dependencyKind: string;
      externalFileName: string | null;
      id: string;
      targetProject: {
        id: string;
        kind: string;
        slug: string;
        title: string;
      } | null;
      targetVersion: {
        id: string;
        versionNumber: string;
      } | null;
    }[];
    downloads: number;
    featured: boolean;
    files: {
      fileName: string;
      hashes?: {
        algorithm: string;
        value: string;
      }[];
      id: string;
      isPrimary: boolean;
      kind?: string;
      scans?: {
        createdAt: Date;
        details: unknown;
        id: string;
        status: string;
        verdict: string | null;
      }[];
      sizeBytes: bigint;
      url: string;
    }[];
    name: string;
    versionNumber: string;
  }> = {},
) {
  return {
    author: {
      avatarUrl: null,
      displayName: 'Release Author',
      id: 'user-a',
      username: 'author',
    },
    changelog: overrides.changelog ?? 'Notes',
    channel: overrides.channel ?? 'RELEASE',
    dependencies: overrides.dependencies ?? [],
    downloads: overrides.downloads ?? 0,
    featured: overrides.featured ?? true,
    createdAt: new Date('2025-12-31T00:00:00.000Z'),
    files: (overrides.files ?? []).map((file) => ({
      hashes: file.hashes ?? [],
      kind: file.kind ?? 'UNIVERSAL',
      scans: file.scans ?? [],
      ...file,
    })),
    gameVersions: [{ gameVersion: { version: '1.21.6' } }],
    id: 'version-a',
    loaders: [{ loader: 'FABRIC' }],
    name: overrides.name ?? 'Example',
    project: { slug: 'example' },
    publishedAt: new Date('2026-01-01T00:00:00.000Z'),
    requestedStatus: null,
    sortOrder: 7,
    status: 'APPROVED',
    updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    versionNumber: overrides.versionNumber ?? '1.0.0',
  };
}
