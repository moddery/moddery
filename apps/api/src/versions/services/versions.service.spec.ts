import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { VersionsService } from './versions.service.js';

describe(VersionsService.name, () => {
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
              Promise.resolve({
                changelog: 'Notes',
                channel: 'RELEASE',
                downloads: 0,
                files: [
                  {
                    fileName: 'example.jar',
                    id: 'file-a',
                    isPrimary: true,
                    sizeBytes: 123n,
                    url: 'https://example.test/example.jar',
                  },
                ],
                gameVersions: [{ gameVersion: { version: '1.21.6' } }],
                id: 'version-a',
                loaders: [{ loader: 'FABRIC' }],
                name: 'Example',
                project: { slug: 'example' },
                publishedAt: new Date('2026-01-01T00:00:00.000Z'),
                status: 'APPROVED',
                versionNumber: '1.0.0',
              }),
          },
          versionFile: {
            create: () => {
              transactionSteps.push('file');
              return Promise.resolve({});
            },
          },
          versionGameVersion: {
            create: () => Promise.resolve({}),
          },
          versionLoader: {
            create: () => Promise.resolve({}),
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
            {
              changelog: 'Release notes',
              channel: 'RELEASE',
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
              gameVersions: [
                {
                  gameVersion: { version: '1.21.6' },
                },
              ],
              id: 'version-a',
              loaders: [{ loader: 'FABRIC' }],
              name: 'Example 1.0.0',
              project: { slug: 'example' },
              publishedAt: new Date('2026-01-01T00:00:00.000Z'),
              status: 'APPROVED',
              versionNumber: '1.0.0',
            },
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
