import { describe, expect, test } from 'bun:test';

import { editDependencyButtonLabel } from './EditVersionDependencyForm.tsx';
import {
  dependencyExternalFilePatch,
  dependencyProjectPatch,
  dependencyVersionPatch,
} from './edit-version-dependencies/useVersionDependencyFormState.ts';

describe(editDependencyButtonLabel.name, () => {
  test('describes idle and submitting states', () => {
    expect(editDependencyButtonLabel(false)).toBe('Save dependencies');
    expect(editDependencyButtonLabel(true)).toBe('Saving...');
  });
});

describe('dependency target patches', () => {
  test('uses an external file as the only dependency target when filled', () => {
    expect(dependencyExternalFilePatch('client.jar')).toEqual({
      externalFileName: 'client.jar',
      targetProjectSlug: '',
      targetVersionId: '',
    });
  });

  test('keeps project targets editable after clearing an external file', () => {
    expect(dependencyExternalFilePatch('')).toEqual({
      externalFileName: '',
    });
  });

  test('uses a project as the dependency target and clears stale targets', () => {
    expect(dependencyProjectPatch('sodium')).toEqual({
      externalFileName: '',
      targetProjectSlug: 'sodium',
      targetVersionId: '',
    });
  });

  test('uses a version as the dependency target and clears stale external files', () => {
    expect(dependencyVersionPatch('version-1')).toEqual({
      externalFileName: '',
      targetVersionId: 'version-1',
    });
  });
});
