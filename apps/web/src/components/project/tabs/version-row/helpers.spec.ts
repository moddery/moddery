import { describe, expect, test } from 'bun:test';

import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { dependencyProjectHref } from './helpers.ts';

describe(dependencyProjectHref.name, () => {
  test('links dependency targets to their exact version when present', () => {
    const dependency = dependencyFixture({
      targetProject: {
        id: 'project-a',
        kind: 'MOD',
        slug: 'required-lib',
        title: 'Required Lib',
      },
      targetVersion: {
        id: 'version-a',
        versionNumber: '1.0.0+fabric',
      },
    });

    expect(dependencyProjectHref(dependency)).toBe(
      '/mods?project=required-lib&type=mod&tab=versions&version=1.0.0%2Bfabric',
    );
  });

  test('links project-level dependency targets to the project page', () => {
    const dependency = dependencyFixture({
      targetProject: {
        id: 'project-a',
        kind: 'PLUGIN',
        slug: 'required-plugin',
        title: 'Required Plugin',
      },
      targetVersion: null,
    });

    expect(dependencyProjectHref(dependency)).toBe(
      '/plugins?project=required-plugin&type=plugin',
    );
  });

  test('does not link external file dependencies', () => {
    expect(
      dependencyProjectHref(
        dependencyFixture({
          externalFileName: 'external.jar',
          targetProject: null,
          targetVersion: null,
        }),
      ),
    ).toBeNull();
  });
});

function dependencyFixture(
  patch: Partial<ProjectVersion['dependencies'][number]> = {},
): ProjectVersion['dependencies'][number] {
  return {
    dependencyKind: 'REQUIRED',
    externalFileName: null,
    id: 'dependency-a',
    targetProject: null,
    targetVersion: null,
    ...patch,
  };
}
