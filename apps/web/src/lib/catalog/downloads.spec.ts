import { describe, expect, test } from 'bun:test';

import { downloadProjectFile, downloadUrlForFile } from './downloads.js';
import { type ProjectVersion } from './types.js';

describe(downloadProjectFile.name, () => {
  test('navigates through the counted API download endpoint', () => {
    const navigations: string[] = [];

    downloadProjectFile({
      file: projectFile(),
      navigate: (url) => navigations.push(url),
    });

    expect(navigations).toEqual([
      'http://localhost:13001/downloads/files/file-a',
    ]);
  });

  test('builds canonical API download URLs with encoded file IDs', () => {
    expect(downloadUrlForFile('file/a b')).toBe(
      'http://localhost:13001/downloads/files/file%2Fa%20b',
    );
  });
});

function projectFile(): ProjectVersion['files'][number] {
  return {
    filename: 'plugin.jar',
    hashes: [],
    id: 'file-a',
    primary: true,
    scans: [],
    size: 1024,
    kind: 'UNIVERSAL',
    url: 'https://files.example.test/plugin.jar',
  };
}
