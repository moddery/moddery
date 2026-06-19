import { describe, expect, test } from 'bun:test';

import { localVersionFileSelection } from './usePublishVersionFormState.ts';

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
