import { describe, expect, test } from 'bun:test';

import { collectionVisibilityMeta } from './collectionVisibility.js';

describe('collectionVisibilityMeta', () => {
  test('formats known collection visibility states', () => {
    expect(collectionVisibilityMeta('PRIVATE').label).toBe('Private');
    expect(collectionVisibilityMeta('UNLISTED').label).toBe('Unlisted');
    expect(collectionVisibilityMeta('PUBLIC').label).toBe('Public');
  });

  test('defaults unknown visibility values to public', () => {
    expect(collectionVisibilityMeta('UNKNOWN').label).toBe('Public');
  });
});
