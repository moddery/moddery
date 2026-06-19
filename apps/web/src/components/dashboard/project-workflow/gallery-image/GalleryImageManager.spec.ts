import { describe, expect, test } from 'bun:test';

import {
  galleryImageActionMessage,
  galleryImageRemoveButtonLabel,
  galleryImageSaveButtonLabel,
} from './GalleryImageManager.tsx';

describe(galleryImageActionMessage.name, () => {
  test('describes a saved gallery image', () => {
    expect(galleryImageActionMessage()).toBe('Image saved.');
  });
});

describe(galleryImageSaveButtonLabel.name, () => {
  test('describes idle and saving states', () => {
    expect(galleryImageSaveButtonLabel(null)).toBe('Save image');
    expect(galleryImageSaveButtonLabel('save')).toBe('Saving...');
    expect(galleryImageSaveButtonLabel('remove')).toBe('Save image');
  });
});

describe(galleryImageRemoveButtonLabel.name, () => {
  test('describes idle and removing states', () => {
    expect(galleryImageRemoveButtonLabel(null)).toBe('Remove');
    expect(galleryImageRemoveButtonLabel('remove')).toBe('Removing...');
    expect(galleryImageRemoveButtonLabel('save')).toBe('Remove');
  });
});
