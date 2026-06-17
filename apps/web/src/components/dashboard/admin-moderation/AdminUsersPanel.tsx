import { AdminUserRow } from './admin-users/AdminUserRow.tsx';
import { useAdminUsersPanelState } from './admin-users/useAdminUsersPanelState.ts';
import { ReportActionButton } from './shared.tsx';

export function AdminUsersPanel({ viewerId }: { viewerId: string }) {
  const { busyUserId, message, updateAccount, users, usersQuery } =
    useAdminUsersPanelState();

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
        <ReportActionButton
          disabled={usersQuery.isFetching}
          onClick={() => void usersQuery.refetch()}
        >
          Refresh
        </ReportActionButton>
      </div>
      {message && (
        <p className="mt-3 text-sm font-semibold text-muted">{message}</p>
      )}
      {usersQuery.isLoading && (
        <p className="mt-4 text-sm text-muted">Loading users...</p>
      )}
      <div className="mt-4 grid gap-3">
        {users.map((user) => (
          <AdminUserRow
            key={user.id}
            busy={busyUserId === user.id}
            self={user.id === viewerId}
            user={user}
            onUpdate={updateAccount}
          />
        ))}
      </div>
    </section>
  );
}
