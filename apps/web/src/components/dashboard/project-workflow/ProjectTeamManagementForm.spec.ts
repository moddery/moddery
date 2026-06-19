import { describe, expect, test } from 'bun:test';

import { projectTeamInviteButtonLabel } from './ProjectTeamManagementForm.tsx';
import {
  assertProjectTeamMemberInput,
  normalizeProjectTeamMemberInput,
  normalizeRemoveProjectTeamMemberInput,
} from './team-management/project-team-input.ts';

describe(projectTeamInviteButtonLabel.name, () => {
  test('describes idle and saving states', () => {
    expect(projectTeamInviteButtonLabel(false)).toBe('Invite member');
    expect(projectTeamInviteButtonLabel(true)).toBe('Saving...');
  });
});

describe(normalizeProjectTeamMemberInput.name, () => {
  test('trims editable project team member fields', () => {
    expect(
      normalizeProjectTeamMemberInput({
        permissions: ['MANAGE_VERSIONS'],
        projectSlug: ' example ',
        role: ' Maintainer ',
        username: ' alice ',
      }),
    ).toEqual({
      permissions: ['MANAGE_VERSIONS'],
      projectSlug: 'example',
      role: 'Maintainer',
      username: 'alice',
    });
  });

  test('defaults blank roles to member', () => {
    expect(
      normalizeProjectTeamMemberInput({
        permissions: [],
        projectSlug: 'example',
        role: '   ',
        username: 'alice',
      }).role,
    ).toBe('Member');
  });
});

describe(normalizeRemoveProjectTeamMemberInput.name, () => {
  test('trims remove member fields', () => {
    expect(
      normalizeRemoveProjectTeamMemberInput({
        projectSlug: ' example ',
        username: ' alice ',
      }),
    ).toEqual({
      projectSlug: 'example',
      username: 'alice',
    });
  });
});

describe(assertProjectTeamMemberInput.name, () => {
  test('rejects missing projects', () => {
    expect(() => {
      assertProjectTeamMemberInput({
        projectSlug: ' ',
        username: 'alice',
      });
    }).toThrow('Choose a project before updating team members');
  });

  test('rejects blank usernames', () => {
    expect(() => {
      assertProjectTeamMemberInput({
        projectSlug: 'example',
        username: ' ',
      });
    }).toThrow('Username is required');
  });
});
