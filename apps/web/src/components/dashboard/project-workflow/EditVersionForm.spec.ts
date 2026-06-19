import { describe, expect, test } from 'bun:test';

import { editVersionButtonLabel } from './EditVersionForm.tsx';

describe(editVersionButtonLabel.name, () => {
  test('describes idle and submitting states', () => {
    expect(editVersionButtonLabel(false)).toBe('Save version');
    expect(editVersionButtonLabel(true)).toBe('Saving...');
  });
});
