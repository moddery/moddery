import { type ProjectMember } from '../../../../lib/catalog.ts';
import { permissionLabel } from '../../../../lib/permissions.ts';

export function ProjectTeamMembersList({
  isLoading,
  members,
}: {
  isLoading: boolean;
  members: ProjectMember[];
}) {
  if (isLoading) {
    return (
      <p className="py-2 text-sm font-semibold text-muted">
        Loading team members...
      </p>
    );
  }

  if (members.length === 0) {
    return (
      <p className="py-2 text-sm font-semibold text-muted">
        No team members found.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const name = member.user.display_name ?? member.user.username;

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
              {member.owner ? ' · Owner' : ''}
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
