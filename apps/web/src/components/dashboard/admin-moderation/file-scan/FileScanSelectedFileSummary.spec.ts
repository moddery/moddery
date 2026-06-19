import { describe, expect, test } from 'bun:test';

import { type ProjectFile } from '../../../../lib/catalog.ts';
import { latestFileScans } from './FileScanSelectedFileSummary.tsx';

describe(latestFileScans.name, () => {
  test('returns the three newest scans first without mutating the file', () => {
    const file = fileFixture();
    const originalOrder = file.scans.map((scan) => scan.id);

    expect(latestFileScans(file).map((scan) => scan.id)).toEqual([
      'scan-4',
      'scan-3',
      'scan-2',
    ]);
    expect(file.scans.map((scan) => scan.id)).toEqual(originalOrder);
  });
});

function fileFixture(): ProjectFile {
  return {
    filename: 'server.jar',
    hashes: [],
    id: 'file-a',
    kind: 'SERVER',
    primary: true,
    scans: [
      scanFixture('scan-1', '2026-06-15T00:00:00.000Z'),
      scanFixture('scan-3', '2026-06-17T00:00:00.000Z'),
      scanFixture('scan-2', '2026-06-16T00:00:00.000Z'),
      scanFixture('scan-4', '2026-06-18T00:00:00.000Z'),
    ],
    size: 1024,
    url: 'https://files.example.test/server.jar',
  };
}

function scanFixture(id: string, createdAt: string) {
  return {
    createdAt,
    details: null,
    id,
    status: 'COMPLETE',
    verdict: 'CLEAN',
  };
}
