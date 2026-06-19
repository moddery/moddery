import { type ReportReason } from '@moddery/shared';
import { type FormEvent, useState } from 'react';

import { hasAuthToken } from '../../../lib/catalog.ts';
import {
  createUserReport,
  type PublicUserProfile,
} from '../../../lib/users.ts';
import { reportReasons } from '../reportReasons.ts';

export function ProfileReportForm({
  profile,
  onRequestAuth,
  onSubmitted,
  onMessage,
}: {
  profile: PublicUserProfile;
  onRequestAuth?: () => void;
  onSubmitted: () => void;
  onMessage: (message: string | null) => void;
}) {
  const [reason, setReason] = useState<ReportReason>('IMPERSONATION');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAuthToken()) {
      onRequestAuth?.();
      onMessage('Sign in to report a user.');
      return;
    }

    setBusy(true);
    onMessage(null);

    try {
      await createUserReport({
        body,
        reason,
        username: profile.username,
      });
      setBody('');
      onMessage('Report submitted.');
      onSubmitted();
    } catch (caught) {
      onMessage(caught instanceof Error ? caught.message : 'Report failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submitReport(event)}
      className="mt-4 max-w-3xl rounded-lg border border-line bg-surface-2 p-3"
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
    </form>
  );
}
