import { describe, expect, test } from 'bun:test';

import {
  workflowProjectHref,
  workflowVersionHref,
} from './version-route-links.ts';

describe(workflowProjectHref.name, () => {
  test('builds the public project route from the workflow project kind', () => {
    expect(workflowProjectHref({ kind: 'MOD', slug: 'create-things' })).toBe(
      '/mods?project=create-things&type=mod',
    );
  });

  test('uses the plural plugin route for plugin projects', () => {
    expect(workflowProjectHref({ kind: 'PLUGIN', slug: 'world-tools' })).toBe(
      '/plugins?project=world-tools&type=plugin',
    );
  });
});

describe(workflowVersionHref.name, () => {
  test('adds a version tab target with an encoded version number', () => {
    expect(
      workflowVersionHref(
        { kind: 'PLUGIN', slug: 'world-tools' },
        { versionNumber: '1.2 beta' },
      ),
    ).toBe(
      '/plugins?project=world-tools&type=plugin&tab=versions&version=1.2%20beta',
    );
  });
});
