import { describe, expect, test } from 'bun:test';

import { editVersionButtonLabel } from './EditVersionForm.tsx';
import {
  assertUpdateVersionInput,
  normalizeUpdateVersionInput,
} from './edit-version/update-version-input.ts';

describe(editVersionButtonLabel.name, () => {
  test('describes idle and submitting states', () => {
    expect(editVersionButtonLabel(false)).toBe('Save version');
    expect(editVersionButtonLabel(true)).toBe('Saving...');
  });
});

describe(normalizeUpdateVersionInput.name, () => {
  test('trims editable text fields before saving a version', () => {
    expect(
      normalizeUpdateVersionInput({
        changelog: '  Fixes and polish  ',
        channel: 'RELEASE',
        featured: false,
        gameVersions: ['1.21.6'],
        loaders: ['fabric'],
        name: '  Release  ',
        sortOrder: 2,
        versionId: 'version-a',
        versionNumber: '  1.0.0  ',
      }),
    ).toMatchObject({
      changelog: 'Fixes and polish',
      name: 'Release',
      versionNumber: '1.0.0',
    });
  });

  test('normalizes blank changelogs to null', () => {
    expect(
      normalizeUpdateVersionInput({
        changelog: '   ',
        channel: 'BETA',
        featured: true,
        gameVersions: [],
        loaders: [],
        name: 'Release',
        sortOrder: 0,
        versionId: 'version-a',
        versionNumber: '1.0.0',
      }).changelog,
    ).toBeNull();
  });
});

describe(assertUpdateVersionInput.name, () => {
  test('rejects missing selected versions', () => {
    expect(() => {
      assertUpdateVersionInput(validUpdateVersionInput({ versionId: '  ' }));
    }).toThrow('Choose a version before saving changes');
  });

  test('rejects blank version names', () => {
    expect(() => {
      assertUpdateVersionInput(validUpdateVersionInput({ name: '  ' }));
    }).toThrow('Version name is required');
  });

  test('rejects blank version numbers', () => {
    expect(() => {
      assertUpdateVersionInput(
        validUpdateVersionInput({ versionNumber: '  ' }),
      );
    }).toThrow('Version number is required');
  });
});

function validUpdateVersionInput(
  overrides: Partial<Parameters<typeof assertUpdateVersionInput>[0]> = {},
) {
  return {
    changelog: null,
    channel: 'RELEASE' as const,
    featured: false,
    gameVersions: ['1.21.6'],
    loaders: ['fabric'],
    name: 'Release',
    sortOrder: 0,
    versionId: 'version-a',
    versionNumber: '1.0.0',
    ...overrides,
  };
}
