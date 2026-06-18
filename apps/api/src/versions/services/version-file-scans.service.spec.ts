import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { VersionFileScansService } from './version-file-scans.service.js';

describe(VersionFileScansService.name, () => {
  test('records moderator file scan results', async () => {
    const creates: unknown[] = [];
    const service = new VersionFileScansService({
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

function versionRow(
  overrides: Partial<{
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
  }> = {},
) {
  return {
    author: {
      avatarUrl: null,
      displayName: 'Release Author',
      id: 'user-a',
      username: 'author',
    },
    changelog: 'Notes',
    channel: 'RELEASE',
    dependencies: [],
    downloads: 0,
    featured: true,
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
    name: 'Example',
    project: { slug: 'example' },
    publishedAt: new Date('2026-01-01T00:00:00.000Z'),
    requestedStatus: null,
    sortOrder: 7,
    status: 'APPROVED',
    updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    versionNumber: '1.0.0',
  };
}
