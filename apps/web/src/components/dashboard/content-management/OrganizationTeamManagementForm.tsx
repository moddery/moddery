import { type DashboardOrganization } from '../../../lib/dashboard.ts';
import { OrganizationTeamFields } from './organization-team/OrganizationTeamFields.tsx';
import { OrganizationTeamMembersList } from './organization-team/OrganizationTeamMembersList.tsx';
import { useOrganizationTeamManagementState } from './organization-team/useOrganizationTeamManagementState.ts';

export function OrganizationTeamManagementForm({
  onChanged,
  organizations,
}: {
  onChanged: () => Promise<void>;
  organizations: DashboardOrganization[];
}) {
  const state = useOrganizationTeamManagementState(organizations);
  const organization = organizations.find(
    ({ id }) => id === state.organizationId,
  );

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    if (await state.addMember(event)) {
      await onChanged();
    }
  }

  async function removeMember() {
    if (await state.removeMember()) {
      await onChanged();
    }
  }

  if (organizations.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Manage organization team
        </h2>
        <p className="text-sm leading-6 text-muted">
          Invite an existing user to an organization team or remove a non-owner
          member.
        </p>
      </div>

      <form
        onSubmit={(event) => void addMember(event)}
        className="mt-4 grid gap-3"
      >
        <OrganizationTeamFields
          disabled={state.submitting}
          organizationId={state.organizationId}
          organizations={organizations}
          permissions={state.permissions}
          role={state.role}
          setOrganizationId={state.setOrganizationId}
          setPermissions={state.setPermissions}
          setRole={state.setRole}
          setUsername={state.setUsername}
          username={state.username}
        />

        <OrganizationTeamMembersList organization={organization} />

        {state.message && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            {state.message}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={state.submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {organizationTeamInviteButtonLabel(state.submitting)}
          </button>
          <button
            type="button"
            disabled={state.submitting || state.username.trim() === ''}
            onClick={() => void removeMember()}
            className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove member
          </button>
        </div>
      </form>
    </section>
  );
}

export function organizationTeamInviteButtonLabel(submitting: boolean) {
  return submitting ? 'Saving...' : 'Invite member';
}
