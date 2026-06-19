import { describe, expect, test } from 'bun:test';

import {
  addGalleryImageButtonLabel,
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
