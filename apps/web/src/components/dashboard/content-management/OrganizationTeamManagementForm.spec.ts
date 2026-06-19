import { describe, expect, test } from 'bun:test';

import { organizationTeamInviteButtonLabel } from './OrganizationTeamManagementForm.tsx';

describe(organizationTeamInviteButtonLabel.name, () => {
  test('describes idle and saving states', () => {
    expect(organizationTeamInviteButtonLabel(false)).toBe('Invite member');
    expect(organizationTeamInviteButtonLabel(true)).toBe('Saving...');
  });
});
