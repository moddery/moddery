import { type ReportReason } from '@moddery/shared';
import { Flag } from 'lucide-react';
import { useState } from 'react';

import {
  createProjectReport,
  hasAuthToken,
  type ProjectDetails,
} from '../../../lib/catalog.ts';
import { reportReasons } from '../ProjectContentTabs.tsx';

export function ProjectReportSection({ project }: { project: ProjectDetails }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('BROKEN_OR_MISLEADING');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAuthToken()) {
      setMessage('Sign in to report a project.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await createProjectReport({
        body,
        projectSlug: project.slug,
        reason,
      });
      setBody('');
      setMessage('Report submitted.');
      setOpen(false);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Report failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-control px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
      >
        <Flag className="size-4 text-accent-icon" />
        Report project
      </button>

      {open && (
        <form onSubmit={(event) => void submitReport(event)} className="mt-3">
          <label className="block text-xs font-bold uppercase text-muted">
            Reason
            <select
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as ReportReason)
              }
              className="mt-1 h-9 w-full rounded-md border border-line bg-control px-2 text-sm normal-case text-ink outline-none focus-visible:border-accent"
            >
              {reportReasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-xs font-bold uppercase text-muted">
            Details
            <textarea
              required
              minLength={8}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-line bg-control px-2 py-2 text-sm normal-case text-ink outline-none placeholder:text-faint focus-visible:border-accent"
              placeholder="What should moderators know?"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-2 inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit report
          </button>
        </form>
      )}

      {message && (
        <p className="mt-2 text-xs font-semibold text-muted">{message}</p>
      )}
    </section>
  );
}
