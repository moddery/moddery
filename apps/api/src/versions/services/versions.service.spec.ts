import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { VersionDependenciesService } from './version-dependencies.service.js';
import { VersionsService } from './versions.service.js';

function createVersionsService(prisma: PrismaService) {
  return new VersionsService(
    prisma,
    new VersionDependenciesService(prisma),
    { delete: () => Promise.resolve() } as never,
    { updateProjectUpdatedAt: () => Promise.resolve() } as never,
  );
}

describe(VersionsService.name, () => {
  test('replaces version dependencies for accepted project members', async () => {
    const operations: string[] = [];
    const service = createVersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          project: {
            findUnique: () => Promise.resolve({ id: 'project-b' }),
            update: (query: unknown) => {
              operations.push(`project-update:${JSON.stringify(query)}`);
              return Promise.resolve({});
            },
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
    expect(operations[2]).toContain('"where":{"id":"project-a"}');
    expect(version.dependencies[0]?.targetProject?.slug).toBe('library');
  });

  test('updates versions for accepted project members', async () => {
    const operations: string[] = [];
    const service = createVersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          gameVersion: {
            upsert: () => Promise.resolve({ id: 'game-version-a' }),
          },
          project: {
            update: (query: unknown) => {
              operations.push(`project-update:${JSON.stringify(query)}`);
              return Promise.resolve({});
            },
          },
          version: {
            findUniqueOrThrow: () =>
              Promise.resolve(
                versionRow({
                  changelog: 'Updated notes',
                  channel: 'BETA',
                  featured: false,
                  name: 'Updated',
                  requestedStatus: null,
                  sortOrder: 3,
                  status: 'ARCHIVED',
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
        featured: false,
        gameVersions: ['1.21.6'],
        loaders: ['fabric'],
        name: 'Updated',
        requestedStatus: null,
        sortOrder: 3,
        status: 'ARCHIVED',
        versionId: 'version-a',
        versionNumber: '1.0.1',
      },
      'user-a',
    );

    expect(operations[0]).toContain('"name":"Updated"');
    expect(operations[0]).toContain('"featured":false');
    expect(operations[0]).toContain('"requestedStatus":null');
    expect(operations[0]).toContain('"sortOrder":3');
    expect(operations[0]).toContain('"status":"ARCHIVED"');
    expect(operations).toContain(
      'versions-delete:{"where":{"versionId":"version-a"}}',
    );
    expect(operations).toContain(
      'loaders-delete:{"where":{"versionId":"version-a"}}',
    );
    expect(
      operations.some((operation) => operation.includes('project-update')),
    ).toBeTrue();
    expect(version.versionNumber).toBe('1.0.1');
  });

  test('loads all managed project versions regardless of status', async () => {
    const service = createVersionsService({
      project: {
        findUnique: () =>
          Promise.resolve({
            id: 'project-a',
            team: { members: [{ userId: 'user-a' }] },
          }),
      },
      version: {
        count: (query: unknown) => {
          expect(query).toEqual({ where: { projectId: 'project-a' } });
          return Promise.resolve(2);
        },
        findMany: (query: unknown) => {
          expect(query).toMatchObject({
            skip: 5,
            take: 5,
            where: { projectId: 'project-a' },
          });
          return Promise.resolve([
            versionRow({ status: 'ARCHIVED', versionNumber: '0.9.0' }),
            versionRow({ status: 'DRAFT', versionNumber: '1.0.0' }),
          ]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findManagedProjectVersionSearch(
      'example',
      'user-a',
      { limit: 5, offset: 5 },
    );

    expect(result.totalHits).toBe(2);
    expect(result.versions.map((version) => version.status)).toEqual([
      'ARCHIVED',
      'DRAFT',
    ]);
  });

  test('creates approved versions for accepted project members', async () => {
    const transactionSteps: string[] = [];
    const service = createVersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          project: {
            update: () => Promise.resolve({}),
          },
          gameVersion: {
            upsert: () => Promise.resolve({ id: 'game-version-a' }),
          },
          version: {
            findUnique: () => Promise.resolve(null),
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

  test('rejects duplicate version numbers before creating files', async () => {
    const transactionSteps: string[] = [];
    const service = createVersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          version: {
            findUnique: () => Promise.resolve({ id: 'version-existing' }),
            create: () => {
              transactionSteps.push('version');
              return Promise.resolve({ id: 'version-a' });
            },
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

    let caught: unknown;
    try {
      await service.createVersion(validCreateVersionInput(), 'user-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Version number already exists');
    expect(transactionSteps).toEqual([]);
  });

  test('rejects invalid version file metadata before opening a transaction', async () => {
    const service = createVersionsService({
      $transaction: () => {
        throw new Error('Version transaction should not run');
      },
      project: {
        findUnique: () =>
          Promise.resolve({
            id: 'project-a',
            slug: 'example',
            team: { members: [{ userId: 'user-a' }] },
          }),
      },
    } as unknown as PrismaService);

    const input = validCreateVersionInput();
    const [file] = input.files;
    if (file === undefined) throw new Error('Missing test file');
    input.files[0] = {
      ...file,
      primary: false,
      sizeBytes: 0,
    };

    let caught: unknown;
    try {
      await service.createVersion(input, 'user-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'A primary version file is required',
    );
  });
});

function validCreateVersionInput() {
  return {
    changelog: 'Notes',
    channel: 'RELEASE' as const,
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
  };
}

function managedVersion() {
  return {
    id: 'version-a',
    project: {
      id: 'project-a',
      slug: 'example',
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
    requestedStatus: string | null;
    sortOrder: number;
    status: string;
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
    requestedStatus: overrides.requestedStatus ?? null,
    sortOrder: overrides.sortOrder ?? 7,
    status: overrides.status ?? 'APPROVED',
    updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    versionNumber: overrides.versionNumber ?? '1.0.0',
  };
}
