import { type ReactNode } from 'react';

import { Pagination } from '../../../Pagination.tsx';
import { type FriendshipSummary } from '../../../../lib/users.ts';
import { FriendRow } from './FriendRow.tsx';

export function FriendGroup({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <h3 className="text-sm font-extrabold text-ink">{label}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function FriendList({
  busyUsername,
  emptyLabel,
  friendships,
  onAccept,
  onBlock,
  onPage,
  onRemove,
  page,
  totalHits,
  totalPages,
}: {
  busyUsername: string | null;
  emptyLabel: string;
  friendships: FriendshipSummary[];
  onAccept?: (username: string) => void;
  onBlock?: (username: string) => void;
  onPage: (page: number) => void;
  onRemove: (username: string) => void;
  page: number;
  totalHits: number;
  totalPages: number;
}) {
  if (friendships.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase text-muted">
          Showing {friendships.length.toLocaleString('en-US')} of{' '}
          {totalHits.toLocaleString('en-US')}
        </p>
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        )}
      </div>

      <div>
        {friendships.map((friendship) => (
          <FriendRow
            busy={busyUsername === friendship.user.username}
            friendship={friendship}
            key={friendship.id}
            onAccept={onAccept}
            onBlock={onBlock}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
