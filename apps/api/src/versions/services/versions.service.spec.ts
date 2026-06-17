import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { VersionsService } from './versions.service.js';

describe(VersionsService.name, () => {
  test('replaces version dependencies for accepted project members', async () => {
    const operations: string[] = [];
    const service = new VersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          project: {
            findUnique: () => Promise.resolve({ id: 'project-b' }),
          },
          version: {
            findUniqueOrThrow: () =>
              Promise.resolve(
                versionRow({
                  dependencies: [
                    {
                      dependencyKind: 'REQUIRED',
                      externalFileName: null,
                      id: 'dependency-a',
                      targetProject: {
                        id: 'project-b',
                        kind: 'MOD',
                        slug: 'library',
                        title: 'Library',
                      },
                      targetVersion: null,
                    },
                  ],
                }),
              ),
          },
          versionDependency: {
            create: (query: unknown) => {
              operations.push(`create:${JSON.stringify(query)}`);
              return Promise.resolve({});
            },
            deleteMany: (query: unknown) => {
              operations.push(`delete:${JSON.stringify(query)}`);
              return Promise.resolve({});
            },
          },
        }),
      version: {
        findFirst: () => Promise.resolve(managedVersion()),
      },
    } as unknown as PrismaService);

    const version = await service.updateVersionDependencies(
      {
        dependencies: [
          {
            dependencyKind: 'REQUIRED',
            targetProjectSlug: 'library',
          },
        ],
        versionId: 'version-a',
      },
      'user-a',
    );

    expect(operations[0]).toBe('delete:{"where":{"versionId":"version-a"}}');
    expect(operations[1]).toContain('"targetProjectId":"project-b"');
    expect(version.dependencies[0]?.targetProject?.slug).toBe('library');
  });

  test('updates versions for accepted project members', async () => {
    const operations: string[] = [];
    const service = new VersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          gameVersion: {
            upsert: () => Promise.resolve({ id: 'game-version-a' }),
          },
          version: {
            findUniqueOrThrow: () =>
              Promise.resolve(
                versionRow({
                  changelog: 'Updated notes',
                  channel: 'BETA',
                  name: 'Updated',
                  versionNumber: '1.0.1',
                }),
              ),
            update: (query: unknown) => {
              operations.push(`version-update:${JSON.stringify(query)}`);
              return Promise.resolve({});
            },
          },
          versionGameVersion: {
            create: () => Promise.resolve({}),
            deleteMany: (query: unknown) => {
              operations.push(`versions-delete:${JSON.stringify(query)}`);
              return Promise.resolve({});
            },
          },
          versionLoader: {
            create: () => Promise.resolve({}),
            deleteMany: (query: unknown) => {
              operations.push(`loaders-delete:${JSON.stringify(query)}`);
              return Promise.resolve({});
            },
          },
        }),
      version: {
        findFirst: () => Promise.resolve(managedVersion()),
      },
    } as unknown as PrismaService);

    const version = await service.updateVersion(
      {
        changelog: 'Updated notes',
        channel: 'BETA',
        gameVersions: ['1.21.6'],
        loaders: ['fabric'],
        name: 'Updated',
        versionId: 'version-a',
        versionNumber: '1.0.1',
      },
      'user-a',
    );

    expect(operations[0]).toContain('"name":"Updated"');
    expect(operations).toContain(
      'versions-delete:{"where":{"versionId":"version-a"}}',
    );
    expect(operations).toContain(
      'loaders-delete:{"where":{"versionId":"version-a"}}',
    );
    expect(version.versionNumber).toBe('1.0.1');
  });

  test('creates approved versions for accepted project members', async () => {
    const transactionSteps: string[] = [];
    const service = new VersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          gameVersion: {
            upsert: () => Promise.resolve({ id: 'game-version-a' }),
          },
          version: {
            create: () => {
              transactionSteps.push('version');
              return Promise.resolve({ id: 'version-a' });
            },
            findUniqueOrThrow: () =>
              Promise.resolve(
                versionRow({
                  changelog: 'Notes',
                  files: [
                    {
                      fileName: 'example.jar',
                      hashes: [{ algorithm: 'SHA256', value: 'abc123' }],
                      id: 'file-a',
                      isPrimary: true,
                      scans: [],
                      sizeBytes: 123n,
                      url: 'https://example.test/example.jar',
                    },
                  ],
                }),
              ),
          },
          versionFile: {
            create: () => {
              transactionSteps.push('file');
              return Promise.resolve({ id: 'file-a' });
            },
          },
          fileHash: {
            upsert: () => {
              transactionSteps.push('hash');
              return Promise.resolve({});
            },
          },
          versionGameVersion: {
            create: () => Promise.resolve({}),
            deleteMany: () => Promise.resolve({}),
          },
          versionLoader: {
            create: () => Promise.resolve({}),
            deleteMany: () => Promise.resolve({}),
          },
        }),
      project: {
        findUnique: () =>
          Promise.resolve({
            id: 'project-a',
            slug: 'example',
            team: { members: [{ userId: 'user-a' }] },
          }),
      },
    } as unknown as PrismaService);

    const version = await service.createVersion(
      {
        changelog: 'Notes',
        channel: 'RELEASE',
        files: [
          {
            fileName: 'example.jar',
            hashes: [{ algorithm: 'sha256', value: 'ABC123' }],
            primary: true,
            sizeBytes: 123,
            url: 'https://example.test/example.jar',
          },
        ],
        gameVersions: ['1.21.6'],
        loaders: ['fabric'],
        name: 'Example',
        projectSlug: 'example',
        versionNumber: '1.0.0',
      },
      'user-a',
    );

    expect(transactionSteps).toEqual(['version', 'file', 'hash']);
    expect(version.files[0]?.hashes[0]?.value).toBe('abc123');
    expect(version.files[0]?.sizeBytes).toBe('123');
    expect(version.projectSlug).toBe('example');
  });

  test('loads approved project versions with files and metadata', async () => {
    const queries: unknown[] = [];
    const service = new VersionsService({
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
    const service = new VersionsService({
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

  test('records moderator file scan results', async () => {
    const creates: unknown[] = [];
    const service = new VersionsService({
      fileScan: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve({});
        },
      },
      version: {
        findUniqueOrThrow: () =>
          Promise.resolve(
            versionRow({
              files: [
                {
                  fileName: 'example.jar',
                  hashes: [],
                  id: 'file-a',
                  isPrimary: true,
                  scans: [
                    {
                      createdAt: new Date('2026-01-02T00:00:00.000Z'),
                      details: { engine: 'scanner' },
                      id: 'scan-a',
                      status: 'COMPLETE',
                      verdict: 'CLEAN',
                    },
                  ],
                  sizeBytes: 1234n,
                  url: 'https://example.test/example.jar',
                },
              ],
            }),
          ),
      },
      versionFile: {
        findUnique: () => Promise.resolve({ id: 'file-a', versionId: 'v-a' }),
      },
    } as unknown as PrismaService);

    const version = await service.recordFileScan(
      {
        details: '{ "engine": "scanner" }',
        fileId: 'file-a',
        status: ' COMPLETE ',
        verdict: ' CLEAN ',
      },
      { id: 'mod-a', role: 'MODERATOR', username: 'mod' },
    );

    expect(creates[0]).toEqual({
      data: {
        details: { engine: 'scanner' },
        fileId: 'file-a',
        status: 'COMPLETE',
        verdict: 'CLEAN',
      },
    });
    expect(version.files[0]?.scans[0]?.verdict).toBe('CLEAN');
  });
});

function managedVersion() {
  return {
    id: 'version-a',
    project: {
      team: { members: [{ userId: 'user-a' }] },
    },
  };
}

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
