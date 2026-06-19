import { describe, expect, test } from 'bun:test';

import { downloadProjectFile } from './downloads.js';
import { type DownloadRecord, type ProjectVersion } from './types.js';

describe(downloadProjectFile.name, () => {
  test('navigates immediately and records download counts when available', async () => {
    const navigations: string[] = [];
    const recorded: DownloadRecord[] = [];
    const pending = Promise.resolve(downloadRecord());

    downloadProjectFile({
      file: projectFile(),
      navigate: (url) => navigations.push(url),
      onRecorded: (record) => recorded.push(record),
      record: () => pending,
    });

    expect(navigations).toEqual(['https://files.example.test/plugin.jar']);

    await pending;
    await Promise.resolve();

    expect(recorded).toEqual([downloadRecord()]);
  });

  test('still navigates when download recording rejects', async () => {
    const errors: unknown[] = [];
    const navigations: string[] = [];
    const pending = Promise.reject(new Error('analytics unavailable'));
    pending.catch(() => undefined);

    downloadProjectFile({
      file: projectFile(),
      navigate: (url) => navigations.push(url),
      onRecorded: () => {
        throw new Error('Download record should not be emitted');
      },
      onRecordError: (error) => errors.push(error),
      record: () => pending,
    });

    await pending.catch(() => undefined);
    await Promise.resolve();

    expect(navigations).toEqual(['https://files.example.test/plugin.jar']);
    expect(errors[0]).toBeInstanceOf(Error);
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

function downloadRecord(): DownloadRecord {
  return {
    fileId: 'file-a',
    projectDownloads: 42,
    projectId: 'project-a',
    versionDownloads: 7,
    versionId: 'version-a',
  };
}
