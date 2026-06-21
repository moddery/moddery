import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { type ClamavScannerService } from '../../scanner/clamav-scanner.service.js';
import { VersionFileScansService } from './version-file-scans.service.js';

describe(VersionFileScansService.name, () => {
  test('records moderator file scan results', async () => {
    const creates: unknown[] = [];
    const service = new VersionFileScansService(
      prismaMock({
        creates,
        versionFiles: { id: 'file-a', versionId: 'v-a' },
      }),
      scannerMock(),
    );

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

  test('runs ClamAV scans and records the result', async () => {
    const creates: unknown[] = [];
    const scannedUrls: string[] = [];
    const service = new VersionFileScansService(
      prismaMock({
        creates,
        versionFiles: {
          fileName: 'example.jar',
          id: 'file-a',
          sizeBytes: 1234n,
          url: 'https://files.example.test/example.jar',
          versionId: 'v-a',
        },
      }),
      scannerMock({
        scanUrl: (url) => {
          scannedUrls.push(url);
          return Promise.resolve({
            rawResponse: 'stream: OK',
            signature: null,
            status: 'COMPLETE',
            verdict: 'CLEAN',
          });
        },
      }),
    );

    const version = await service.scanVersionFile('file-a', {
      id: 'mod-a',
      role: 'MODERATOR',
      username: 'mod',
    });

    expect(scannedUrls).toEqual(['https://files.example.test/example.jar']);
    expect(creates[0]).toEqual({
      data: {
        details: {
          engine: 'clamav',
          fileName: 'example.jar',
          rawResponse: 'stream: OK',
          scannedAt: expect.any(String),
          signature: null,
          sizeBytes: '1234',
        },
        fileId: 'file-a',
        status: 'COMPLETE',
        verdict: 'CLEAN',
      },
    });
    expect(version.files[0]?.scans[0]?.status).toBe('COMPLETE');
  });

  test('blocks non-moderators from running scans', async () => {
    const service = new VersionFileScansService(prismaMock(), scannerMock());

    try {
      await service.scanVersionFile('file-a', {
        id: 'user-a',
        role: 'USER',
        username: 'user',
      });
      throw new Error('Expected scan to reject');
    } catch (caught) {
      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toContain('Moderator access required');
    }
  });
});

function prismaMock({
  creates = [],
  versionFiles = { id: 'file-a', versionId: 'v-a' },
}: {
  creates?: unknown[];
  versionFiles?: {
    fileName?: string;
    id: string;
    sizeBytes?: bigint;
    url?: string;
    versionId: string;
  };
} = {}): PrismaService {
  return {
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
      findUnique: () => Promise.resolve(versionFiles),
    },
  } as unknown as PrismaService;
}

function scannerMock(
  overrides: Partial<Pick<ClamavScannerService, 'scanUrl'>> = {},
): ClamavScannerService {
  return {
    scanUrl: () =>
      Promise.resolve({
        rawResponse: 'stream: OK',
        signature: null,
        status: 'COMPLETE',
        verdict: 'CLEAN',
      }),
    ...overrides,
  } as ClamavScannerService;
}

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
