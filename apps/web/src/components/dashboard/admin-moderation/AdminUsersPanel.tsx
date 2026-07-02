import { type FormEvent } from 'react';

import { Pagination } from '../../Pagination.tsx';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';
import { AdminUserRow } from './admin-users/AdminUserRow.tsx';
import { useAdminUsersPanelState } from './admin-users/useAdminUsersPanelState.ts';
import { DashboardField, ReportActionButton } from './shared.tsx';

export function AdminUsersPanel({ viewerId }: { viewerId: string }) {
  const {
    busyUserId,
    message,
    page,
    searchInput,
    setPage,
    setSearchInput,
    submitSearch,
    totalHits,
    totalPages,
    updateAccount,
    users,
    usersQuery,
  } = useAdminUsersPanelState();
  const busy = adminUsersPanelBusy(busyUserId);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    submitSearch();
  }

  return (
    <CollapsiblePanel
      title="User accounts"
      description="Recent accounts and moderation access."
      hint={`${totalHits.toLocaleString('en-US')} users`}
      action={
        <ReportActionButton
          disabled={busy || usersQuery.isFetching}
          onClick={() => void usersQuery.refetch()}
        >
          Refresh
        </ReportActionButton>
      }
    >
      <form onSubmit={onSearch} className="mt-4 flex max-w-xl gap-2">
        <div className="min-w-0 flex-1">
          <DashboardField
            label="Search users"
            placeholder="username, email, role, or status"
            disabled={busy}
            value={searchInput}
            onChange={setSearchInput}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-6 rounded-lg bg-accent px-4 text-sm font-extrabold text-accent-ink transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          Search
        </button>
      </form>
      {message && (
        <p className="mt-3 text-sm font-semibold text-muted">{message}</p>
      )}
      {usersQuery.isLoading && (
        <p className="mt-4 text-sm text-muted">Loading users...</p>
      )}
      <div className="mt-4 grid gap-3">
        {totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              disabled={busy}
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
          </div>
        )}
        {users.map((user) => (
          <AdminUserRow
            key={user.id}
            busy={busy}
            self={user.id === viewerId}
            user={user}
            onUpdate={updateAccount}
          />
        ))}
        {users.length === 0 && !usersQuery.isLoading && (
          <p className="py-8 text-sm text-muted">No matching users.</p>
        )}
        {totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              disabled={busy}
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
}

export function adminUsersPanelBusy(busyUserId: string | null) {
  return busyUserId !== null;
}
