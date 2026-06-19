import { describe, expect, test } from 'bun:test';

import { versionCompatibilityTag } from './VersionMetadata.tsx';

describe(versionCompatibilityTag.name, () => {
  test('builds loader search tags for a project type', () => {
    expect(versionCompatibilityTag('loader', 'plugin', 'paper')).toEqual({
      kind: 'loader',
      projectType: 'plugin',
      value: 'paper',
    });
  });

  test('builds game version search tags for a project type', () => {
    expect(versionCompatibilityTag('version', 'modpack', '1.21.6')).toEqual({
      kind: 'version',
      projectType: 'modpack',
      value: '1.21.6',
    });
  });
});
