import { Crown, UserRound } from 'lucide-react';

import {
  type OrganizationMember,
  type OrganizationProfile,
} from '../../lib/organizations.ts';
import { Pagination } from '../Pagination.tsx';

export function OrganizationMembers({
  isLoading,
  members,
  onPage,
  organization,
  page,
  totalPages,
}: {
  isLoading: boolean;
  members: OrganizationMember[];
  onPage: (page: number) => void;
  organization: OrganizationProfile;
  page: number;
  totalPages: number;
}) {
  if (organization.memberCount === 0) {
    return null;
  }

  return (
    <section className="border-b border-line py-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Members
        </h2>
        <span className="text-sm font-semibold text-muted">
          {organization.memberCount.toLocaleString('en-US')} total
        </span>
      </div>
      {isLoading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-16 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-16 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-16 animate-pulse rounded-lg bg-surface-2" />
        </div>
      ) : (
        <MemberGrid members={members} />
      )}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </section>
  );
}

function MemberGrid({ members }: { members: OrganizationMember[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const name = member.user.displayName ?? member.user.username;

        return (
          <a
            key={member.user.id}
            href={`/users/${member.user.username}`}
            className="flex min-w-0 items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3 transition-colors hover:border-accent/50"
          >
            <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-surface-2 text-muted">
              {member.user.avatarUrl ? (
                <img
                  src={member.user.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-extrabold text-ink">
                  {name}
                </span>
                {member.isOwner && (
                  <Crown className="size-3.5 shrink-0 text-accent" />
                )}
              </div>
              <p className="truncate text-xs font-semibold text-muted">
                {member.role}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
