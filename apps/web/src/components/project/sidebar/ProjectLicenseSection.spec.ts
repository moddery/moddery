import { describe, expect, test } from 'bun:test';

import { projectLicenseSearchTag } from './ProjectLicenseSection.js';

describe(projectLicenseSearchTag.name, () => {
  test('builds normalized license search tags for project filters', () => {
    expect(
      projectLicenseSearchTag({
        license: { id: 'MIT', name: 'MIT', url: null },
        projectType: 'mod',
      }),
    ).toEqual({
      kind: 'license',
      projectType: 'mod',
      value: 'mit',
    });
  });

  test('does not expose placeholder license keys as filters', () => {
    expect(
      projectLicenseSearchTag({
        license: { id: 'unknown', name: 'Unknown', url: null },
        projectType: 'plugin',
      }),
    ).toBeNull();
  });
});
