import { describe, expect, test } from 'bun:test';

import { addGalleryImageButtonLabel } from './AddGalleryImageForm.tsx';

describe(addGalleryImageButtonLabel.name, () => {
  test('describes idle and submitting states', () => {
    expect(addGalleryImageButtonLabel(false)).toBe('Add gallery image');
    expect(addGalleryImageButtonLabel(true)).toBe('Adding...');
  });
});
