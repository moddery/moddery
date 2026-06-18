import { ShieldCheck, UserRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { useState } from 'react';

import {
  fetchProjectMemberSearch,
  type ProjectMember,
} from '../../../lib/catalog.ts';
import { permissionLabel } from '../../../lib/permissions.ts';
import { Pagination } from '../../Pagination.tsx';

const pageSize = 12;

export function ProjectMembersSection({
  members,
  projectSlug,
}: {
  members: ProjectMember[];
  projectSlug: string;
}) {
  const [page, setPage] = useState(1);
  const membersQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchProjectMemberSearch(projectSlug, page, pageSize, signal),
    queryKey: ['catalog', 'project-members', projectSlug, page],
  });
  const visibleMembers = membersQuery.data?.members ?? members;
  const totalHits = membersQuery.data?.totalHits ?? members.length;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));

  if (membersQuery.isError && members.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-extrabold text-ink">
          Creators
        </h2>
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
          {totalHits.toLocaleString('en-US')}
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {membersQuery.isLoading && members.length === 0 && (
          <p className="text-sm font-semibold text-muted">
            Loading creators...
          </p>
        )}
        {visibleMembers.map((member) => {
          const name = member.user.display_name ?? member.user.username;

          return (
            <a
              key={member.user.id}
              href={`/users/${member.user.username}`}
              className="flex min-w-0 items-start gap-2 rounded-md px-2 py-1.5"
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
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted">
                  <span>{member.owner ? 'Owner' : member.role}</span>
                  {!member.accepted && <MemberBadge>Invited</MemberBadge>}
                  {member.permissions.slice(0, 2).map((permission) => (
                    <MemberBadge key={permission}>
                      {permissionLabel(permission)}
                    </MemberBadge>
                  ))}
                  {member.permissions.length > 2 && (
                    <MemberBadge>
                      +{(member.permissions.length - 2).toLocaleString('en-US')}
                    </MemberBadge>
                  )}
                </span>
              </span>
              {member.owner && (
                <ShieldCheck className="mt-1 size-4 shrink-0 text-accent-icon" />
              )}
            </a>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="mt-3">
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}
    </section>
  );
}

function MemberBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold text-muted">
      {children}
    </span>
  );
}
