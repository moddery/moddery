import { useQuery } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';

import {
  createReportThreadMessage,
  fetchReportThread,
  type ReportThread,
} from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';

export function ReportThreadPanel({ reportId }: { reportId: string }) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadQuery = useQuery({
    queryFn: ({ signal }) => fetchReportThread(reportId, signal),
    queryKey: ['dashboard', 'report-thread', reportId],
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createReportThreadMessage({ body, reportId });
      setBody('');
      await threadQuery.refetch();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Reply failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <h4 className="text-sm font-extrabold text-ink">Discussion</h4>
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
          <ThreadMembers thread={threadQuery.data} />
          <ThreadMessages thread={threadQuery.data} />
        </>
      ) : (
        <p className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Discussion did not return from the API.
        </p>
      )}

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-3 grid gap-2"
      >
        <textarea
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-20 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          placeholder="Add a moderation note"
        />
        {error && (
          <p className="rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Posting...' : 'Post reply'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ThreadMembers({ thread }: { thread: ReportThread }) {
  if (thread.members.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {thread.members.map((member) => {
        const name = member.user.displayName ?? member.user.username;
        const readState =
          member.lastReadAt === null
            ? 'Unread'
            : `Read ${timeAgo(member.lastReadAt)}`;

        return (
          <div
            key={member.user.id}
            className="rounded-md border border-line bg-control px-2.5 py-1.5"
          >
            <p className="text-xs font-extrabold text-ink">{name}</p>
            <p className="text-[11px] font-bold text-muted">{readState}</p>
          </div>
        );
      })}
    </div>
  );
}

function ThreadMessages({ thread }: { thread: ReportThread }) {
  if (thread.messages.length === 0) {
    return (
      <p className="mt-2 text-sm font-semibold text-muted">No replies yet.</p>
    );
  }

  return (
    <div className="mt-3 grid gap-2">
      {thread.messages.map((message) => {
        const author = message.author.displayName ?? message.author.username;

        return (
          <div key={message.id} className="rounded-lg bg-control px-3 py-2">
            <p className="text-sm leading-6 text-ink">{message.body}</p>
            <p className="mt-1 text-xs font-bold text-muted">
              {author} · {timeAgo(message.createdAt)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
