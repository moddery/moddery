import { describe, expect, test } from 'bun:test';

import {
  collectionItemAddedLabel,
  collectionItemPosition,
} from './collection-item-attribution.ts';

describe('collection item attribution helpers', () => {
  test('formats one-based collection item positions', () => {
    expect(collectionItemPosition(0)).toBe('Position 1');
    expect(collectionItemPosition(1200)).toBe('Position 1,201');
  });

  test('formats added timing consistently with collection metadata', () => {
    expect(
      collectionItemAddedLabel(
        '2026-06-17T12:00:00.000Z',
        new Date('2026-06-18T12:00:00.000Z'),
      ),
    ).toBe('Added 1 day ago');
  });
});
