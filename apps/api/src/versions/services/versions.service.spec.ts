import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { VersionDependenciesService } from './version-dependencies.service.js';
import { VersionsService } from './versions.service.js';

function createVersionsService(
  prisma: PrismaService,
  auditEvents: unknown[] = [],
  notifications: unknown[] = [],
) {
  return new VersionsService(
    {
      recordVersionModeration: (event: unknown) => {
        auditEvents.push(event);
        return Promise.resolve();
      },
    } as never,
    {
      sendUserNotification: (notification: unknown) => {
        notifications.push(notification);
        return Promise.resolve({});
      },
    } as never,
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
            findFirst: (query: unknown) => {
              operations.push(`project-find:${JSON.stringify(query)}`);
              return Promise.resolve({ id: 'project-b' });
            },
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
    expect(operations[1]).toBe(
      'project-find:{"select":{"id":true},"where":{"slug":"library","status":"APPROVED"}}',
    );
    expect(operations[2]).toContain('"targetProjectId":"project-b"');
    expect(operations[3]).toContain('"where":{"id":"project-a"}');
    expect(version.dependencies[0]?.targetProject?.slug).toBe('library');
  });

  test('rejects non-public dependency projects', async () => {
    const service = createVersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          project: {
            findFirst: () => Promise.resolve(null),
          },
          versionDependency: {
            create: () => {
              throw new Error('Dependency should not be created');
            },
            deleteMany: () => Promise.resolve({}),
          },
        }),
      version: {
        findFirst: () => Promise.resolve(managedVersion()),
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.updateVersionDependencies(
        {
          dependencies: [
            {
              dependencyKind: 'REQUIRED',
              targetProjectSlug: 'queued-library',
            },
          ],
          versionId: 'version-a',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Dependency project not found');
  });

  test('rejects non-public dependency versions', async () => {
    const versionLookups: unknown[] = [];
    const service = createVersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          version: {
            findFirst: (query: unknown) => {
              versionLookups.push(query);
              return Promise.resolve(null);
            },
          },
          versionDependency: {
            create: () => {
              throw new Error('Dependency should not be created');
            },
            deleteMany: () => Promise.resolve({}),
          },
        }),
      version: {
        findFirst: () => Promise.resolve(managedVersion()),
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.updateVersionDependencies(
        {
          dependencies: [
            {
              dependencyKind: 'REQUIRED',
              targetVersionId: 'queued-version',
            },
          ],
          versionId: 'version-a',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(versionLookups[0]).toEqual({
      select: { id: true },
      where: {
        id: 'queued-version',
        project: { status: 'APPROVED' },
        status: 'APPROVED',
      },
    });
    expect(caught).toHaveProperty('message', 'Dependency version not found');
  });

  test('rejects version dependencies with multiple targets', async () => {
    const operations: string[] = [];
    const service = createVersionsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          project: {
            findFirst: () => {
              throw new Error('Dependency project lookup should not run');
            },
          },
          versionDependency: {
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

    let caught: unknown;
    try {
      await service.updateVersionDependencies(
        {
          dependencies: [
            {
              dependencyKind: 'REQUIRED',
              externalFileName: 'client.jar',
              targetProjectSlug: 'library',
            },
          ],
          versionId: 'version-a',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'Dependency must have exactly one target',
    );
    expect(operations).toEqual(['delete:{"where":{"versionId":"version-a"}}']);
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
                  status: 'APPROVED',
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
        sortOrder: 3,
        versionId: 'version-a',
        versionNumber: '1.0.1',
      },
      'user-a',
    );

    expect(operations[0]).toContain('"name":"Updated"');
    expect(operations[0]).toContain('"featured":false');
    expect(operations[0]).toContain('"sortOrder":3');
    expect(operations[0]).not.toContain('requestedStatus');
    expect(operations[0]).not.toContain('status');
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

  test('rejects creator version status updates', async () => {
    const service = createVersionsService({
      version: {
        findFirst: () => {
          throw new Error('Version lookup should not run');
        },
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.updateVersion(
        {
          status: 'ARCHIVED',
          versionId: 'version-a',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'Version status is managed by moderation',
    );
  });

  test('loads all managed project versions regardless of status', async () => {
    const service = createVersionsService({
      project: {
        findUnique: () =>
          Promise.resolve({
            id: 'project-a',
            status: 'APPROVED',
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

  test('creates queued versions for accepted project members', async () => {
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
            create: (query: unknown) => {
              transactionSteps.push(`version:${JSON.stringify(query)}`);
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
            status: 'APPROVED',
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

    expect(transactionSteps[0]).toContain('"requestedStatus":"APPROVED"');
    expect(transactionSteps[0]).toContain('"status":"PENDING_REVIEW"');
    expect(transactionSteps).toContain('file');
    expect(transactionSteps).toContain('hash');
    expect(version.files[0]?.hashes[0]?.value).toBe('abc123');
    expect(version.files[0]?.sizeBytes).toBe('123');
    expect(version.projectSlug).toBe('example');
  });

  test('loads versions awaiting moderation', async () => {
    const queries: unknown[] = [];
    const service = createVersionsService({
      version: {
        count: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(3);
        },
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            versionRow({
              requestedStatus: 'APPROVED',
              status: 'PENDING_REVIEW',
              versionNumber: '1.0.0',
            }),
          ]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findVersionsForModeration({
      limit: 10,
      offset: 20,
    });

    expect(queries[0]).toEqual({
      where: {
        status: { in: ['PENDING_REVIEW', 'REJECTED', 'ARCHIVED'] },
      },
    });
    expect(queries[1]).toMatchObject({
      skip: 20,
      take: 10,
      where: {
        status: { in: ['PENDING_REVIEW', 'REJECTED', 'ARCHIVED'] },
      },
    });
    expect(result.totalHits).toBe(3);
    expect(result.versions[0]?.status).toBe('PENDING_REVIEW');
  });

  test('approves queued versions for publication', async () => {
    const auditEvents: unknown[] = [];
    const notifications: unknown[] = [];
    const operations: string[] = [];
    const service = createVersionsService(
      {
        $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
          callback({
            project: {
              update: (query: unknown) => {
                operations.push(`project:${JSON.stringify(query)}`);
                return Promise.resolve({});
              },
            },
            version: {
              findUniqueOrThrow: () =>
                Promise.resolve(
                  versionRow({
                    requestedStatus: null,
                    status: 'APPROVED',
                    versionNumber: '1.0.0',
                  }),
                ),
              update: (query: unknown) => {
                operations.push(`version:${JSON.stringify(query)}`);
                return Promise.resolve({});
              },
            },
          }),
        version: {
          findUnique: () =>
            Promise.resolve({
              authorId: 'user-author',
              id: 'version-a',
              name: 'Example',
              project: { id: 'project-a', slug: 'example' },
              requestedStatus: 'APPROVED',
              status: 'PENDING_REVIEW',
              versionNumber: '1.0.0',
            }),
        },
      } as unknown as PrismaService,
      auditEvents,
      notifications,
    );

    const version = await service.moderateVersion(
      {
        action: 'approve',
        reason: ' Looks good ',
        versionId: 'version-a',
      },
      'moderator-a',
    );

    expect(operations[0]).toContain('"status":"APPROVED"');
    expect(operations[0]).toContain('"requestedStatus":null');
    expect(operations[0]).toContain('"publishedAt"');
    expect(operations[1]).toContain('"where":{"id":"project-a"}');
    expect(auditEvents[0]).toEqual({
      action: 'APPROVE',
      actorId: 'moderator-a',
      after: {
        id: 'version-a',
        name: 'Example',
        projectSlug: 'example',
        requestedStatus: null,
        status: 'APPROVED',
        versionNumber: '1.0.0',
      },
      before: {
        id: 'version-a',
        name: 'Example',
        projectSlug: 'example',
        requestedStatus: 'APPROVED',
        status: 'PENDING_REVIEW',
        versionNumber: '1.0.0',
      },
      reason: 'Looks good',
    });
    expect(notifications).toEqual([
      {
        actionUrl: '/dashboard#dashboard-projects',
        body: 'Example 1.0.0 was approved. Reason: Looks good',
        title: 'Release approved',
        type: 'moderation',
        userId: 'user-author',
      },
    ]);
    expect(version.status).toBe('APPROVED');
  });

  test('requires approved projects before creating versions', async () => {
    const service = createVersionsService({
      $transaction: () => {
        throw new Error('Version transaction should not run');
      },
      project: {
        findUnique: () =>
          Promise.resolve({
            id: 'project-a',
            slug: 'example',
            status: 'PENDING_REVIEW',
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

    expect(caught).toHaveProperty(
      'message',
      'Project must be approved before publishing versions',
    );
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
            status: 'APPROVED',
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
            status: 'APPROVED',
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

  test('rejects oversized version file lists before opening a transaction', async () => {
    const service = createVersionsService({
      $transaction: () => {
        throw new Error('Version transaction should not run');
      },
      project: {
        findUnique: () =>
          Promise.resolve({
            id: 'project-a',
            slug: 'example',
            status: 'APPROVED',
            team: { members: [{ userId: 'user-a' }] },
          }),
      },
    } as unknown as PrismaService);

    const input = validCreateVersionInput();
    const [file] = input.files;
    if (file === undefined) throw new Error('Missing test file');
    input.files = Array.from({ length: 9 }, (_, index) => ({
      ...file,
      fileName: `example-${index.toString()}.jar`,
    }));

    let caught: unknown;
    try {
      await service.createVersion(input, 'user-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'A version can include at most 8 files',
    );
  });

  test('rejects oversized version file hash lists before opening a transaction', async () => {
    const service = createVersionsService({
      $transaction: () => {
        throw new Error('Version transaction should not run');
      },
      project: {
        findUnique: () =>
          Promise.resolve({
            id: 'project-a',
            slug: 'example',
            status: 'APPROVED',
            team: { members: [{ userId: 'user-a' }] },
          }),
      },
    } as unknown as PrismaService);

    const input = validCreateVersionInput();
    const [file] = input.files;
    if (file === undefined) throw new Error('Missing test file');
    input.files[0] = {
      ...file,
      hashes: Array.from({ length: 9 }, (_, index) => ({
        algorithm: 'sha256',
        value: index.toString().padStart(64, 'a'),
      })),
    };

    let caught: unknown;
    try {
      await service.createVersion(input, 'user-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'A version file can include at most 8 hashes',
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
      status: 'APPROVED',
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
