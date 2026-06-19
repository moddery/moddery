import { describe, expect, test } from 'bun:test';

import { projectRelationButtonLabel } from './ProjectRelationOperationForm.tsx';

describe(projectRelationButtonLabel.name, () => {
  const action = {
    idleLabel: 'Add project',
    pendingLabel: 'Adding...',
  };

  test('describes idle and pending action states', () => {
    expect(projectRelationButtonLabel(action, false)).toBe('Add project');
    expect(projectRelationButtonLabel(action, true)).toBe('Adding...');
  });
});
