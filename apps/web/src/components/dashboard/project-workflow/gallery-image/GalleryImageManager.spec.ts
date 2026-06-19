import { describe, expect, test } from 'bun:test';

import {
  galleryImageActionMessage,
  galleryImageRemoveButtonLabel,
  galleryImageSaveButtonLabel,
  parseGalleryImageSortOrder,
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

describe(parseGalleryImageSortOrder.name, () => {
  test('parses integer order values', () => {
    expect(parseGalleryImageSortOrder('3')).toBe(3);
    expect(parseGalleryImageSortOrder(' 12 ')).toBe(12);
    expect(parseGalleryImageSortOrder('-1')).toBe(-1);
  });

  test('rejects invalid order values', () => {
    expect(() => parseGalleryImageSortOrder('12.8')).toThrow(
      'Gallery image order must be an integer',
    );
    expect(() => parseGalleryImageSortOrder('nope')).toThrow(
      'Gallery image order must be an integer',
    );
    expect(() => parseGalleryImageSortOrder('')).toThrow(
      'Gallery image order must be an integer',
    );
  });
});
