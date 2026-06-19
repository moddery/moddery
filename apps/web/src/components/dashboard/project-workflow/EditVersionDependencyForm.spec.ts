import { describe, expect, test } from 'bun:test';

import { editDependencyButtonLabel } from './EditVersionDependencyForm.tsx';

describe(editDependencyButtonLabel.name, () => {
  test('describes idle and submitting states', () => {
    expect(editDependencyButtonLabel(false)).toBe('Save dependencies');
    expect(editDependencyButtonLabel(true)).toBe('Saving...');
  });
});
