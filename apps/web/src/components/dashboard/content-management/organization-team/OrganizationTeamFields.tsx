import { type DashboardOrganization } from '../../../../lib/dashboard.ts';
import { organizationTeamPermissions } from '../../../../lib/permissions.ts';
import { TeamPermissionsField } from '../../TeamPermissionsField.tsx';
import { DashboardField } from '../shared.tsx';

interface OrganizationTeamFieldsProps {
  disabled?: boolean;
  organizationId: string;
  organizations: DashboardOrganization[];
  permissions: string[];
  role: string;
  setOrganizationId: (value: string) => void;
  setPermissions: (value: string[]) => void;
  setRole: (value: string) => void;
  setUsername: (value: string) => void;
  username: string;
}

export function OrganizationTeamFields({
  disabled,
  organizationId,
  organizations,
  permissions,
  role,
  setOrganizationId,
  setPermissions,
  setRole,
  setUsername,
  username,
}: OrganizationTeamFieldsProps) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Organization
          <select
            disabled={disabled}
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {organizations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <DashboardField
          disabled={disabled}
          label="Username"
          value={username}
          onChange={setUsername}
          required
        />
        <DashboardField
          disabled={disabled}
          label="Role"
          value={role}
          onChange={setRole}
        />
      </div>
      <TeamPermissionsField
        disabled={disabled}
        options={organizationTeamPermissions}
        permissions={permissions}
        setPermissions={setPermissions}
      />
    </>
  );
}
