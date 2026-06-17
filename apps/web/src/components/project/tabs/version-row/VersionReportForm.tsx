import { type ReportReason } from '@moddery/shared';
import { useState } from 'react';

import {
  createVersionReport,
  hasAuthToken,
  type ProjectVersion,
} from '../../../../lib/catalog.ts';
import { reportReasons } from '../constants.ts';

export function VersionReportForm({
  version,
  onSubmitted,
}: {
  version: ProjectVersion;
  onSubmitted: () => void;
}) {
  const [reason, setReason] = useState<ReportReason>('BROKEN_OR_MISLEADING');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAuthToken()) {
      setMessage('Sign in to report a version.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await createVersionReport({
        body,
        reason,
        versionId: version.id,
      });
      setBody('');
      setMessage('Report submitted.');
      onSubmitted();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Report failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submitReport(event)}
      className="rounded-lg border border-line bg-surface-2 p-3"
    >
      <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end">
        <label className="block text-xs font-bold uppercase text-muted">
          Reason
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value as ReportReason)}
            className="mt-1 h-9 w-full rounded-md border border-line bg-control px-2 text-sm normal-case text-ink outline-none focus-visible:border-accent"
          >
            {reportReasons.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-bold uppercase text-muted">
          Details
          <input
            required
            minLength={8}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-line bg-control px-2 text-sm normal-case text-ink outline-none placeholder:text-faint focus-visible:border-accent"
            placeholder="What should moderators know?"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          Submit report
        </button>
      </div>

      {message && (
        <p className="mt-2 text-xs font-semibold text-muted">{message}</p>
      )}
    </form>
  );
}
