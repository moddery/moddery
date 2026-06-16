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
                      id: 'file-a',
                      isPrimary: true,
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

    expect(transactionSteps).toEqual(['version', 'file']);
    expect(version.files[0]?.sizeBytes).toBe('123');
    expect(version.projectSlug).toBe('example');
  });

  test('loads approved project versions with files and metadata', async () => {
    const queries: unknown[] = [];
    const service = new VersionsService({
      version: {
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            versionRow({
              changelog: 'Release notes',
              downloads: 42,
              files: [
                {
                  fileName: 'example.jar',
                  id: 'file-a',
                  isPrimary: true,
                  sizeBytes: 1234n,
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
        where: {
          project: { slug: 'example' },
          status: 'APPROVED',
        },
      }),
    );
    expect(versions).toEqual([
      {
        changelog: 'Release notes',
        channel: 'RELEASE',
        datePublished: new Date('2026-01-01T00:00:00.000Z'),
        downloads: 42,
        dependencies: [],
        files: [
          {
            fileName: 'example.jar',
            id: 'file-a',
            primary: true,
            sizeBytes: '1234',
            url: 'https://example.test/example.jar',
          },
        ],
        gameVersions: ['1.21.6'],
        id: 'version-a',
        loaders: ['fabric'],
        name: 'Example 1.0.0',
        projectSlug: 'example',
        status: 'APPROVED',
        versionNumber: '1.0.0',
      },
    ]);
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
        slug: string;
        title: string;
      } | null;
      targetVersion: {
        id: string;
        versionNumber: string;
      } | null;
    }[];
    downloads: number;
    files: {
      fileName: string;
      id: string;
      isPrimary: boolean;
      sizeBytes: bigint;
      url: string;
    }[];
    name: string;
    versionNumber: string;
  }> = {},
) {
  return {
    changelog: overrides.changelog ?? 'Notes',
    channel: overrides.channel ?? 'RELEASE',
    dependencies: overrides.dependencies ?? [],
    downloads: overrides.downloads ?? 0,
    files: overrides.files ?? [],
    gameVersions: [{ gameVersion: { version: '1.21.6' } }],
    id: 'version-a',
    loaders: [{ loader: 'FABRIC' }],
    name: overrides.name ?? 'Example',
    project: { slug: 'example' },
    publishedAt: new Date('2026-01-01T00:00:00.000Z'),
    status: 'APPROVED',
    versionNumber: overrides.versionNumber ?? '1.0.0',
  };
}
