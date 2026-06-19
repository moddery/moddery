import { describe, expect, test } from 'bun:test';

import { shouldClearProjectMetadataIconUrl } from './ProjectMetadataForm.tsx';

describe(shouldClearProjectMetadataIconUrl.name, () => {
  test('clears manual project icon URLs when a local icon is selected', () => {
    expect(
      shouldClearProjectMetadataIconUrl(new File(['icon'], 'project.png')),
    ).toBe(true);
  });

  test('keeps manual project icon URLs when the local icon is cleared', () => {
    expect(shouldClearProjectMetadataIconUrl(null)).toBe(false);
  });
});
