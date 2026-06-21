import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchAdminAuditLogSearch } from '../../../lib/dashboard.ts';
import { Pagination } from '../../Pagination.tsx';
import { DashboardPanel, SectionHeader } from '../../ui/dashboard/index.ts';
import { AuditLogEventCard } from './AuditLogEventCard.tsx';
import { ReportActionButton } from './shared.tsx';

export {
  auditResourceHref,
  auditUserHref,
  projectAuditSnapshotHref,
} from './audit-log-links.ts';

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
    <DashboardPanel>
      <SectionHeader
        title="Audit log"
        description="Recent administrative account and project moderation changes."
        action={
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
        }
      />

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
            <AuditLogEventCard key={auditLog.id} auditLog={auditLog} />
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
    </DashboardPanel>
  );
}
