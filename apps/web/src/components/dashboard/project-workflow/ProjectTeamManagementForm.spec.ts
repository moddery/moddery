import { describe, expect, test } from 'bun:test';

import { projectTeamInviteButtonLabel } from './ProjectTeamManagementForm.tsx';

describe(projectTeamInviteButtonLabel.name, () => {
  test('describes idle and saving states', () => {
    expect(projectTeamInviteButtonLabel(false)).toBe('Invite member');
    expect(projectTeamInviteButtonLabel(true)).toBe('Saving...');
  });
});
