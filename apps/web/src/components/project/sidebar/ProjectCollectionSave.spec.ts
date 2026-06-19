import { describe, expect, test } from 'bun:test';

import { viewerCollectionHref } from './ProjectCollectionSave.tsx';

describe(viewerCollectionHref.name, () => {
  test('links saved collection choices to their public collection route', () => {
    expect(
      viewerCollectionHref({
        owner: { username: 'creator one' },
        slug: 'tech packs',
      }),
    ).toBe('/collections/creator%20one/tech%20packs');
  });
});
