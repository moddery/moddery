import { useState } from 'react';

import {
  addProjectTeamMember,
  removeProjectTeamMember,
  type DashboardProject,
} from '../../../../lib/dashboard.ts';
import {
  assertProjectTeamMemberInput,
  normalizeProjectTeamMemberInput,
  normalizeRemoveProjectTeamMemberInput,
} from './project-team-input.ts';

interface PreventableSubmitEvent {
  preventDefault: () => void;
}

export function useProjectTeamManagementState(projects: DashboardProject[]) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Member');
  const [permissions, setPermissions] = useState<string[]>(['MANAGE_VERSIONS']);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function addMember(event: PreventableSubmitEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const input = normalizeProjectTeamMemberInput({
        permissions,
        projectSlug,
        role,
        username,
      });
      assertProjectTeamMemberInput(input);
      const members = await addProjectTeamMember(input);
      setUsername('');
      setMessage(
        `Team now has ${members.length.toLocaleString('en-US')} members.`,
      );
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Team update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function removeMember() {
    setSubmitting(true);
    setMessage(null);

    try {
      const input = normalizeRemoveProjectTeamMemberInput({
        projectSlug,
        username,
      });
      assertProjectTeamMemberInput(input);
      const members = await removeProjectTeamMember(input);
      setUsername('');
      setMessage(
        `Team now has ${members.length.toLocaleString('en-US')} members.`,
      );
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Team update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return {
    addMember,
    message,
    permissions,
    projectSlug,
    removeMember,
    role,
    setPermissions,
    setProjectSlug,
    setRole,
    setUsername,
    submitting,
    username,
  };
}
