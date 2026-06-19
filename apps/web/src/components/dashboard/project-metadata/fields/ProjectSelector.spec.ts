import { describe, expect, test } from 'bun:test';

import { projectSelectorHref } from './ProjectSelector.tsx';

describe(projectSelectorHref.name, () => {
  test('links selected project metadata rows to the public project route', () => {
    expect(projectSelectorHref({ kind: 'MODPACK', slug: 'sky-cities' })).toBe(
      '/modpacks?project=sky-cities&type=modpack',
    );
  });
});
