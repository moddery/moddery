import { UserRound } from 'lucide-react';

import { type ProjectMember } from '../../../lib/catalog.ts';

export function ProjectMembersSection({
  members,
}: {
  members: ProjectMember[];
}) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Creators
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {members.map((member) => {
          const name = member.user.display_name ?? member.user.username;

          return (
            <a
              key={member.user.id}
              href={`/users/${member.user.username}`}
              className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5"
            >
              {member.user.avatar_url ? (
                <img
                  src={member.user.avatar_url}
                  alt=""
                  className="size-8 rounded-md bg-surface-2 object-cover"
                />
              ) : (
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-2 text-accent-icon">
                  <UserRound className="size-4" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">
                  {name}
                </span>
                <span className="block truncate text-xs font-semibold text-muted">
                  {member.owner ? 'Owner' : member.role}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
