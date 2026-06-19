import { describe, expect, test } from 'bun:test';

import {
  relationCollectionHref,
  relationOrganizationHref,
  relationProjectHref,
} from './relation-route-links.ts';

describe(relationCollectionHref.name, () => {
  test('links public and unlisted collections to the owner collection route', () => {
    expect(
      relationCollectionHref(
        { slug: 'server-tools', visibility: 'UNLISTED' },
        'creator one',
      ),
    ).toBe('/collections/creator%20one/server-tools');
  });

  test('does not expose private collections as public links', () => {
    expect(
      relationCollectionHref(
        { slug: 'draft-list', visibility: 'PRIVATE' },
        'creator',
      ),
    ).toBeNull();
  });
});

describe(relationOrganizationHref.name, () => {
  test('links organizations to their public route', () => {
    expect(relationOrganizationHref({ slug: 'core-team' })).toBe(
      '/organizations/core-team',
    );
  });
});

describe(relationProjectHref.name, () => {
  test('links projects using the project kind route', () => {
    expect(
      relationProjectHref({ kind: 'RESOURCE_PACK', slug: 'clear-ui' }),
    ).toBe('/resource-packs?project=clear-ui&type=resourcepack');
  });
});
