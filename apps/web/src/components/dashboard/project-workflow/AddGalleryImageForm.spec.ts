import { describe, expect, test } from 'bun:test';

import {
  addGalleryImageButtonLabel,
  parseOptionalGalleryImageSortOrder,
  shouldClearGalleryImageUrls,
} from './AddGalleryImageForm.tsx';

describe(addGalleryImageButtonLabel.name, () => {
  test('describes idle and submitting states', () => {
    expect(addGalleryImageButtonLabel(false)).toBe('Add gallery image');
    expect(addGalleryImageButtonLabel(true)).toBe('Adding...');
  });
});

describe(shouldClearGalleryImageUrls.name, () => {
  test('clears manual gallery URLs when a local image is selected', () => {
    expect(
      shouldClearGalleryImageUrls(new File(['image'], 'preview.png')),
    ).toBe(true);
  });

  test('keeps manual gallery URLs when the local image is cleared', () => {
    expect(shouldClearGalleryImageUrls(null)).toBe(false);
  });
});

describe(parseOptionalGalleryImageSortOrder.name, () => {
  test('parses explicit integer order values', () => {
    expect(parseOptionalGalleryImageSortOrder('4')).toBe(4);
    expect(parseOptionalGalleryImageSortOrder(' -2 ')).toBe(-2);
  });

  test('preserves blank order values as backend defaults', () => {
    expect(parseOptionalGalleryImageSortOrder('')).toBeNull();
    expect(parseOptionalGalleryImageSortOrder('   ')).toBeNull();
  });

  test('rejects invalid order values', () => {
    expect(() => parseOptionalGalleryImageSortOrder('3.5')).toThrow(
      'Gallery image order must be an integer',
    );
    expect(() => parseOptionalGalleryImageSortOrder('later')).toThrow(
      'Gallery image order must be an integer',
    );
  });
});
