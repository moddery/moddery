import { type DashboardOrganization } from '../../../../lib/dashboard.ts';
import { DashboardField } from '../shared.tsx';

interface OrganizationTeamFieldsProps {
  organizationId: string;
  organizations: DashboardOrganization[];
  permissions: string;
  role: string;
  setOrganizationId: (value: string) => void;
  setPermissions: (value: string) => void;
  setRole: (value: string) => void;
  setUsername: (value: string) => void;
  username: string;
}

export function OrganizationTeamFields({
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
    </>
  );
}
