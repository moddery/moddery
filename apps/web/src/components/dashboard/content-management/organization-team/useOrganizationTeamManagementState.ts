import { useState } from 'react';

import {
  addOrganizationTeamMember,
  removeOrganizationTeamMember,
  type DashboardOrganization,
} from '../../../../lib/dashboard.ts';

interface PreventableSubmitEvent {
  preventDefault: () => void;
}

export function useOrganizationTeamManagementState(
  organizations: DashboardOrganization[],
) {
  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id ?? '',
  );
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Member');
  const [permissions, setPermissions] = useState<string[]>(['MANAGE_DETAILS']);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function addMember(event: PreventableSubmitEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const nextOrganization = await addOrganizationTeamMember({
        organizationId,
        permissions,
        role,
        username,
      });
      setUsername('');
      setMessage(memberCountMessage(nextOrganization));
      return true;
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Team update failed',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function removeMember() {
    setSubmitting(true);
    setMessage(null);

    try {
      const nextOrganization = await removeOrganizationTeamMember({
        organizationId,
        username,
      });
      setUsername('');
      setMessage(memberCountMessage(nextOrganization));
      return true;
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Team update failed',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    addMember,
    message,
    organizationId,
    permissions,
    removeMember,
    role,
    setOrganizationId,
    setPermissions,
    setRole,
    setUsername,
    submitting,
    username,
  };
}

function memberCountMessage(organization: DashboardOrganization): string {
  return `${organization.name} now has ${organization.memberCount.toLocaleString(
    'en-US',
  )} members.`;
}
