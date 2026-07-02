import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  type DashboardVersion,
  fetchModerationVersionSearch,
  moderateVersion,
} from '../../../lib/dashboard.ts';
import { enumLabel } from '../../../lib/labels.ts';
import { Pagination } from '../../Pagination.tsx';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';
import { nullableText } from './shared.tsx';

const releaseModerationPageSize = 20;

export function ReleaseModerationQueue() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reason, setReason] = useState('');

  const versionsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchModerationVersionSearch(page, releaseModerationPageSize, signal),
    queryKey: ['dashboard', 'moderation-versions', page],
  });
  const versions = versionsQuery.data?.versions ?? [];
  const totalHits = versionsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalHits / releaseModerationPageSize),
  );
  const busy = busyId !== null;

  async function act(versionId: string, action: string) {
    setBusyId(versionId);
    setMessage(null);

    try {
      const version = await moderateVersion({
        action,
        reason: nullableText(reason),
        versionId,
      });
      setMessage(releaseModerationActionMessage(action, version));
      setReason('');
      await versionsQuery.refetch();
      if (versions.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Release moderation failed',
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <CollapsiblePanel
      title="Release review"
      hint={`${totalHits.toLocaleString('en-US')} queued`}
      defaultOpen={true}
    >
      <label className="mt-4 grid gap-1 text-sm font-bold text-ink">
        Reason
        <input
          disabled={busy}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Optional moderation note"
        />
      </label>

      {versionsQuery.isLoading ? (
        <p className="mt-4 text-sm text-muted">Loading release queue...</p>
      ) : versionsQuery.error ? (
        <p className="mt-4 text-sm font-semibold text-danger">
          {versionsQuery.error instanceof Error
            ? versionsQuery.error.message
            : 'Release review queue failed to load'}
        </p>
      ) : versions.length === 0 ? (
        <p className="py-8 text-sm text-muted">
          No releases are waiting on moderation.
        </p>
      ) : (
        <div className="mt-4">
          {totalPages > 1 && (
            <div className="mb-3 flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            {versions.map((version) => (
              <ReleaseModerationRow
                busy={busy}
                key={version.id}
                onAction={(action) => void act(version.id, action)}
                version={version}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-3 flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {message}
        </p>
      )}
    </CollapsiblePanel>
  );
}

function ReleaseModerationRow({
  busy,
  onAction,
  version,
}: {
  busy: boolean;
  onAction: (action: string) => void;
  version: DashboardVersion;
}) {
  const primaryFile = version.files.find((file) => file.primary);
  const latestScan = primaryFile?.scans[0] ?? null;

  return (
    <article className="rounded-lg border border-line bg-surface px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink">
            {version.name} {version.versionNumber}
          </h3>
          <p className="mt-1 text-sm font-semibold text-muted">
            {version.projectSlug} · {enumLabel(version.channel)} ·{' '}
            {enumLabel(version.status)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {releaseModerationActions(version.status).map((action) => (
            <button
              className={releaseModerationButtonClass(action.kind)}
              disabled={busy}
              key={action.kind}
              type="button"
              onClick={() => onAction(action.kind)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold uppercase text-faint">File</dt>
          <dd className="font-semibold text-ink">
            {primaryFile?.fileName ?? 'No primary file'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase text-faint">Scan</dt>
          <dd className="font-semibold text-ink">
            {latestScan
              ? `${latestScan.status}${latestScan.verdict ? ` / ${latestScan.verdict}` : ''}`
              : 'No scan yet'}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function releaseModerationActions(
  status: string,
): { kind: string; label: string }[] {
  if (status === 'PENDING_REVIEW') {
    return [
      { kind: 'APPROVE', label: 'Approve' },
      { kind: 'REJECT', label: 'Reject' },
      { kind: 'ARCHIVE', label: 'Archive' },
    ];
  }

  if (status === 'REJECTED') {
    return [
      { kind: 'APPROVE', label: 'Approve' },
      { kind: 'ARCHIVE', label: 'Archive' },
    ];
  }

  if (status === 'ARCHIVED') {
    return [{ kind: 'RESTORE', label: 'Restore' }];
  }

  return [];
}

function releaseModerationButtonClass(action: string): string {
  const base =
    'rounded-md px-3 py-1.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60';
  return action === 'APPROVE'
    ? `${base} bg-accent text-white`
    : `${base} border border-line bg-control text-ink`;
}

export function releaseModerationActionMessage(
  action: string,
  version: Pick<DashboardVersion, 'name' | 'versionNumber'>,
) {
  const label = `${version.name} ${version.versionNumber}`;

  switch (action) {
    case 'APPROVE':
      return `Approved ${label}.`;
    case 'REJECT':
      return `Rejected ${label}.`;
    case 'ARCHIVE':
      return `Archived ${label}.`;
    case 'RESTORE':
      return `Restored ${label}.`;
    default:
      return `Updated ${label}.`;
  }
}
