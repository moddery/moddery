import { type DashboardOrganization } from '../../../../lib/dashboard.ts';
import { permissionLabel } from '../../../../lib/permissions.ts';

export function OrganizationTeamMembersList({
  organization,
}: {
  organization: DashboardOrganization | undefined;
}) {
  if (!organization) {
    return null;
  }

  return (
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
                    {permissionLabel(permission)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
