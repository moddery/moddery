import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchModerationReports,
  updateReportState,
  type ModerationReportState,
} from '../../../lib/dashboard.ts';
import { Pagination } from '../../Pagination.tsx';
import { ReportRow } from './reports/ReportRow.tsx';

const pageSize = 20;

export function ModerationQueue() {
  const [page, setPage] = useState(1);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const reportsQuery = useQuery({
    queryFn: ({ signal }) => fetchModerationReports(page, pageSize, signal),
    queryKey: ['dashboard', 'moderation-reports', page],
  });

  const reports = reportsQuery.data?.reports ?? [];
  const totalHits = reportsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));
  async function setReportState(id: string, state: ModerationReportState) {
    setUpdatingReportId(id);
    try {
      await updateReportState(id, state);
      await reportsQuery.refetch();
      if (reports.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } finally {
      setUpdatingReportId(null);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Moderation queue
        </h2>
        <span className="text-sm font-semibold text-muted">
          {totalHits.toLocaleString('en-US')} active
        </span>
      </div>

      {reportsQuery.isLoading ? (
        <div className="mt-4 grid gap-3">
          <div className="h-24 animate-pulse rounded bg-surface-2" />
          <div className="h-24 animate-pulse rounded bg-surface-2" />
        </div>
      ) : reports.length === 0 ? (
        <p className="py-8 text-sm text-muted">No active reports.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {totalPages > 1 && (
            <div className="flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
          {reports.map((report) => (
            <ReportRow
              key={report.id}
              report={report}
              disabled={updatingReportId === report.id}
              onStateChange={setReportState}
            />
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
