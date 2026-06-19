import { describe, expect, test } from 'bun:test';

import {
  localVersionFilePatch,
  localVersionFileSelection,
} from './usePublishVersionFormState.ts';

describe(localVersionFileSelection.name, () => {
  test('maps a chosen file to release file metadata', () => {
    const file = new File(['release'], 'release.jar');

    expect(localVersionFileSelection(file)).toEqual({
      fileName: 'release.jar',
      fileSize: '7',
    });
  });

  test('clears release file metadata when the local file is removed', () => {
    expect(localVersionFileSelection(null)).toEqual({
      fileName: '',
      fileSize: '0',
    });
  });
});

describe(localVersionFilePatch.name, () => {
  test('clears manual URL and hash fields when a local file is selected', () => {
    const file = new File(['release'], 'release.jar');

    expect(localVersionFilePatch(file)).toEqual({
      fileName: 'release.jar',
      fileSize: '7',
      fileUrl: '',
      sha1: '',
      sha256: '',
    });
  });

  test('clears local-only file metadata when the local file is removed', () => {
    expect(localVersionFilePatch(null)).toEqual({
      fileName: '',
      fileSize: '0',
    });
  });
});
