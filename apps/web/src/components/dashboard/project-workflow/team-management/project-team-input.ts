import {
  type AddProjectTeamMemberInput,
  type RemoveProjectTeamMemberInput,
} from '../../../../lib/dashboard.ts';

export function normalizeProjectTeamMemberInput(
  input: AddProjectTeamMemberInput,
): AddProjectTeamMemberInput {
  return {
    ...input,
    projectSlug: input.projectSlug.trim(),
    role: input.role.trim() || 'Member',
    username: input.username.trim(),
  };
}

export function normalizeRemoveProjectTeamMemberInput(
  input: RemoveProjectTeamMemberInput,
): RemoveProjectTeamMemberInput {
  return {
    projectSlug: input.projectSlug.trim(),
    username: input.username.trim(),
  };
}

export function assertProjectTeamMemberInput(
  input: AddProjectTeamMemberInput | RemoveProjectTeamMemberInput,
): void {
  if (input.projectSlug.trim().length === 0) {
    throw new Error('Choose a project before updating team members');
  }

  if (input.username.trim().length === 0) {
    throw new Error('Username is required');
  }
}
