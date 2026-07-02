import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchModerationReports,
  type ModerationReport,
  updateReportState,
  type ModerationReportState,
} from '../../../lib/dashboard.ts';
import { Pagination } from '../../Pagination.tsx';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';
import { ReportRow } from './reports/ReportRow.tsx';

const pageSize = 20;

export function ModerationQueue() {
  const [page, setPage] = useState(1);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const reportsQuery = useQuery({
    queryFn: ({ signal }) => fetchModerationReports(page, pageSize, signal),
    queryKey: ['dashboard', 'moderation-reports', page],
  });

  const reports = reportsQuery.data?.reports ?? [];
  const totalHits = reportsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));
  async function setReportState(id: string, state: ModerationReportState) {
    setUpdatingReportId(id);
    setMessage(null);

    try {
      const report = await updateReportState(id, state);
      setMessage(reportStateUpdateMessage(report, state));
      await reportsQuery.refetch();
      if (reports.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Report update failed',
      );
    } finally {
      setUpdatingReportId(null);
    }
  }

  return (
    <CollapsiblePanel
      title="Moderation queue"
      hint={`${totalHits.toLocaleString('en-US')} active`}
      defaultOpen={true}
    >
      {message && (
        <p className="mt-4 rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {message}
        </p>
      )}

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
    </CollapsiblePanel>
  );
}

export function reportStateUpdateMessage(
  report: Pick<ModerationReport, 'state'>,
  requestedState: ModerationReportState,
) {
  const state = report.state || requestedState;

  switch (state) {
    case 'TRIAGED':
      return 'Marked report as triaged.';
    case 'OPEN':
      return 'Reopened report.';
    case 'CLOSED':
      return 'Closed report.';
    default:
      return 'Updated report.';
  }
}
