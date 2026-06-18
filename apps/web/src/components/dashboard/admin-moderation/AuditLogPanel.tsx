import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchAdminAuditLogSearch } from '../../../lib/dashboard.ts';
import { timeAgo } from '../../../lib/format.ts';
import { Pagination } from '../../Pagination.tsx';
import { ReportActionButton } from './shared.tsx';

const auditPageSize = 20;

export function AuditLogPanel() {
  const [page, setPage] = useState(1);
  const auditLogsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchAdminAuditLogSearch(page, auditPageSize, signal),
    queryKey: ['dashboard', 'audit-logs', page],
  });
  const auditLogs = auditLogsQuery.data?.auditLogs ?? [];
  const totalHits = auditLogsQuery.data?.totalHits ?? 0;
  const totalPages = Math.ceil(totalHits / auditPageSize);

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Audit log
          </h2>
          <p className="mt-1 text-sm text-muted">
            Recent administrative account changes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-muted">
            {totalHits.toLocaleString('en-US')} events
          </span>
          <ReportActionButton
            disabled={auditLogsQuery.isFetching}
            onClick={() => void auditLogsQuery.refetch()}
          >
            Refresh
          </ReportActionButton>
        </div>
      </div>

      {auditLogsQuery.isLoading ? (
        <p className="mt-4 text-sm text-muted">Loading audit events...</p>
      ) : auditLogsQuery.error ? (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {auditLogsQuery.error instanceof Error
            ? auditLogsQuery.error.message
            : 'Audit events failed to load'}
        </p>
      ) : auditLogs.length === 0 ? (
        <p className="py-8 text-sm text-muted">No audit events yet.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {auditLogs.map((auditLog) => (
            <article
              key={auditLog.id}
              className="rounded-lg border border-line bg-surface-2 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-ink">
                    {auditActionLabel(auditLog.action)}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {auditActorLabel(auditLog)} changed{' '}
                    {auditTargetLabel(auditLog)} {timeAgo(auditLog.createdAt)}
                  </p>
                </div>
                <span className="rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted">
                  {auditLog.action.toLowerCase().replaceAll('_', ' ')}
                </span>
              </div>
              {(auditLog.before || auditLog.after) && (
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <AuditSnapshot label="Before" snapshot={auditLog.before} />
                  <AuditSnapshot label="After" snapshot={auditLog.after} />
                </dl>
              )}
            </article>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AuditSnapshot({
  label,
  snapshot,
}: {
  label: string;
  snapshot: {
    role: string;
    status: string;
  } | null;
}) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2">
      <dt className="text-xs font-bold uppercase text-faint">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">
        {snapshot ? `${snapshot.role} / ${snapshot.status}` : 'Unavailable'}
      </dd>
    </div>
  );
}

function auditActionLabel(action: string) {
  return action === 'USER_ACCOUNT_UPDATED'
    ? 'User account updated'
    : action.toLowerCase().replaceAll('_', ' ');
}

function auditActorLabel({
  actor,
  actorId,
}: {
  actor: { displayName: string | null; username: string } | null;
  actorId: string | null;
}) {
  return actor?.displayName ?? actor?.username ?? actorId ?? 'Unknown actor';
}

function auditTargetLabel({
  targetUser,
  targetUserId,
}: {
  targetUser: { displayName: string | null; username: string } | null;
  targetUserId: string | null;
}) {
  return (
    targetUser?.displayName ?? targetUser?.username ?? targetUserId ?? 'a user'
  );
}
