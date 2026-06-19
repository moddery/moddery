import { describe, expect, test } from 'bun:test';

import { projectAnalyticsHref } from './ProjectAnalyticsPanel.tsx';

describe(projectAnalyticsHref.name, () => {
  test('links selected analytics projects to their public project route', () => {
    expect(projectAnalyticsHref({ kind: 'PLUGIN', slug: 'world-tools' })).toBe(
      '/plugins?project=world-tools&type=plugin',
    );
  });
});
