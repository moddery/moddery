import { useState } from 'react';

import {
  addOrganizationTeamMember,
  removeOrganizationTeamMember,
  type DashboardOrganization,
} from '../../../lib/dashboard.ts';
import { DashboardField } from './shared.tsx';

export function OrganizationTeamManagementForm({
  onChanged,
  organizations,
}: {
  onChanged: () => Promise<void>;
  organizations: DashboardOrganization[];
}) {
  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id ?? '',
  );
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Member');
  const [permissions, setPermissions] = useState('MANAGE_DETAILS');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const organization = organizations.find(({ id }) => id === organizationId);

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const nextOrganization = await addOrganizationTeamMember({
        organizationId,
        permissions: splitList(permissions),
        role,
        username,
      });
      setUsername('');
      setMessage(
        `${nextOrganization.name} now has ${nextOrganization.memberCount.toLocaleString(
          'en-US',
        )} members.`,
      );
      await onChanged();
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
      const nextOrganization = await removeOrganizationTeamMember({
        organizationId,
        username,
      });
      setUsername('');
      setMessage(
        `${nextOrganization.name} now has ${nextOrganization.memberCount.toLocaleString(
          'en-US',
        )} members.`,
      );
      await onChanged();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Team update failed',
      );
    } finally {
      setSubmitting(false);
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
          Add an existing user to an organization team or remove a non-owner
          member.
        </p>
      </div>

      <form
        onSubmit={(event) => void addMember(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Organization
            <select
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {organizations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <DashboardField
            label="Username"
            value={username}
            onChange={setUsername}
            required
          />
          <DashboardField label="Role" value={role} onChange={setRole} />
        </div>
        <DashboardField
          label="Permissions"
          value={permissions}
          onChange={setPermissions}
          placeholder="MANAGE_DETAILS, VIEW_ANALYTICS"
        />

        {organization && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {organization.members.map((member) => {
              const name = member.user.displayName ?? member.user.username;

              return (
                <div
                  key={member.user.id}
                  className="min-w-0 rounded-lg border border-line bg-surface px-3 py-2"
                >
                  <div className="truncate text-sm font-extrabold text-ink">
                    {name}
                  </div>
                  <div className="truncate text-xs font-semibold text-muted">
                    {member.role}
                    {member.isOwner ? ' · Owner' : ''}
                  </div>
                  {member.permissions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {member.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-md bg-control px-2 py-1 text-[11px] font-bold text-muted"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {message && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Add team member'}
          </button>
          <button
            type="button"
            disabled={submitting || username.trim() === ''}
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

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
