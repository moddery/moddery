import { type FormEvent } from 'react';

import { Pagination } from '../../Pagination.tsx';
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
    <section className="mt-8 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            User accounts
          </h2>
          <p className="mt-1 text-sm text-muted">
            Recent accounts and moderation access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-muted">
            {totalHits.toLocaleString('en-US')} users
          </span>
          <ReportActionButton
            disabled={busy || usersQuery.isFetching}
            onClick={() => void usersQuery.refetch()}
          >
            Refresh
          </ReportActionButton>
        </div>
      </div>
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
    </section>
  );
}

export function adminUsersPanelBusy(busyUserId: string | null) {
  return busyUserId !== null;
}
