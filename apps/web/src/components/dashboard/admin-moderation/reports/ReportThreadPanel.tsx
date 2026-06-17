import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { fetchReportThread } from '../../../../lib/dashboard.ts';
import { ReportThreadMembers } from './thread/ReportThreadMembers.tsx';
import { ReportThreadMessages } from './thread/ReportThreadMessages.tsx';
import { useReportThreadReplyState } from './thread/useReportThreadReplyState.ts';

export function ReportThreadPanel({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const threadQuery = useQuery({
    enabled: open,
    queryFn: ({ signal }) => fetchReportThread(reportId, signal),
    queryKey: ['dashboard', 'report-thread', reportId],
  });
  const reply = useReportThreadReplyState({
    onPosted: threadQuery.refetch,
    reportId,
  });

  return (
    <div className="mt-4 border-t border-line pt-4">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover"
      >
        <MessageSquare className="size-4 text-accent-icon" />
        {open ? 'Hide discussion' : 'Show discussion'}
      </button>

      {open && (
        <>
          {threadQuery.isLoading ? (
            <p className="mt-2 text-sm font-semibold text-muted">
              Loading discussion...
            </p>
          ) : threadQuery.error ? (
            <p className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
              {threadQuery.error instanceof Error
                ? threadQuery.error.message
                : 'Discussion failed to load'}
            </p>
          ) : threadQuery.data ? (
            <>
              <ReportThreadMembers thread={threadQuery.data} />
              <ReportThreadMessages thread={threadQuery.data} />
            </>
          ) : (
            <p className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
              Discussion did not return from the API.
            </p>
          )}

          <form
            onSubmit={(event) => void reply.submit(event)}
            className="mt-3 grid gap-2"
          >
            <textarea
              required
              value={reply.body}
              onChange={(event) => reply.setBody(event.target.value)}
              className="min-h-20 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
              placeholder="Add a moderation note"
            />
            {reply.error && (
              <p className="rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
                {reply.error}
              </p>
            )}
            <div>
              <button
                type="submit"
                disabled={reply.submitting}
                className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reply.submitting ? 'Posting...' : 'Post reply'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
