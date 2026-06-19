import { describe, expect, test } from 'bun:test';

import { buildPlatformDiscoverHref } from './PlatformPage.js';

describe(buildPlatformDiscoverHref.name, () => {
  test('links license metadata to filtered project search', () => {
    expect(buildPlatformDiscoverHref({ license: 'apache-2.0' })).toBe(
      '/mods?license=apache-2.0',
    );
  });

  test('uses scoped project kind paths for category links', () => {
    expect(
      buildPlatformDiscoverHref({
        category: 'optimization',
        projectKind: 'PLUGIN',
      }),
    ).toBe('/plugins?category=optimization');
  });

  test('combines compatibility filters on the default project path', () => {
    expect(
      buildPlatformDiscoverHref({
        loader: 'fabric',
        version: '1.21.6',
      }),
    ).toBe('/mods?loader=fabric&version=1.21.6');
  });
});
