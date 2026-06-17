import { useQuery } from '@tanstack/react-query';
import { type FormEvent } from 'react';
import { useState } from 'react';

import {
  createDirectThread,
  createDirectThreadMessage,
  fetchViewerDirectThreads,
} from '../../../lib/dashboard/actions/account.ts';
import { type DirectThread } from '../../../lib/dashboard/types.ts';
import { timeAgo } from '../../../lib/format.ts';
import { Pagination } from '../../Pagination.tsx';
import { DashboardField } from './shared.tsx';

const pageSize = 20;

export function DirectMessagesPanel() {
  const [body, setBody] = useState('');
  const [messageBodyByThread, setMessageBodyByThread] = useState<
    Record<string, string>
  >({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const threadsQuery = useQuery({
    queryFn: ({ signal }) => fetchViewerDirectThreads(page, pageSize, signal),
    queryKey: ['dashboard', 'direct-threads', page],
  });

  async function startThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      await createDirectThread({ body, username });
      setBody('');
      setUsername('');
      setPage(1);
      await threadsQuery.refetch();
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Message failed');
    }
  }

  async function replyToThread(threadId: string) {
    const body = messageBodyByThread[threadId]?.trim() ?? '';
    if (body.length === 0) {
      return;
    }

    setStatus(null);
    try {
      await createDirectThreadMessage({ body, threadId });
      setMessageBodyByThread((current) => ({ ...current, [threadId]: '' }));
      await threadsQuery.refetch();
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Message failed');
    }
  }

  const threads = threadsQuery.data?.threads ?? [];
  const totalHits = threadsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));

  return (
    <section className="mt-8 border-t border-line pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Messages
          </h2>
          <p className="mt-1 text-sm text-muted">
            {threadsQuery.data
              ? `${totalHits.toLocaleString('en-US')} direct threads`
              : 'Send direct messages to other users.'}
          </p>
        </div>
        {status && (
          <span className="text-sm font-semibold text-muted">{status}</span>
        )}
      </div>

      <form onSubmit={startThread} className="mt-4 grid gap-3 md:grid-cols-3">
        <DashboardField
          required
          label="Username"
          placeholder="handle"
          value={username}
          onChange={setUsername}
        />
        <label className="grid gap-1 text-sm font-bold text-ink md:col-span-2">
          Message
          <div className="flex gap-2">
            <input
              required
              value={body}
              placeholder="Write a message"
              onChange={(event) => setBody(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
            />
            <button className="rounded-lg bg-accent px-4 text-sm font-extrabold text-accent-ink transition-colors hover:bg-accent-strong">
              Send
            </button>
          </div>
        </label>
      </form>

      <div className="mt-4 grid gap-3">
        {threadsQuery.isLoading ? (
          <p className="text-sm text-muted">Loading messages...</p>
        ) : threads.length === 0 ? (
          <p className="text-sm text-muted">No messages yet.</p>
        ) : (
          <>
            {totalPages > 1 && (
              <div className="flex justify-end">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPage={setPage}
                />
              </div>
            )}
            {threads.map((thread) => (
              <DirectThreadRow
                key={thread.id}
                thread={thread}
                value={messageBodyByThread[thread.id] ?? ''}
                onChange={(value) =>
                  setMessageBodyByThread((current) => ({
                    ...current,
                    [thread.id]: value,
                  }))
                }
                onReply={() => replyToThread(thread.id)}
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
          </>
        )}
      </div>
    </section>
  );
}

function DirectThreadRow({
  onChange,
  onReply,
  thread,
  value,
}: {
  onChange: (value: string) => void;
  onReply: () => void;
  thread: DirectThread;
  value: string;
}) {
  const messages = [...thread.messages].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {thread.members.map((member) => {
            const name = member.user.displayName ?? member.user.username;

            return (
              <a
                key={member.user.id}
                href={`/users/${member.user.username}`}
                className="font-bold text-ink transition-colors hover:text-accent"
              >
                {name}
              </a>
            );
          })}
        </div>
        <span className="text-xs font-semibold uppercase text-muted">
          Updated {timeAgo(thread.updatedAt)}
        </span>
      </div>
      <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">No messages in this thread.</p>
        ) : (
          messages.map((message) => {
            const author =
              message.author.displayName ?? message.author.username;

            return (
              <div
                key={message.id}
                className="rounded-md border border-line bg-surface-2 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted">
                  <a
                    href={`/users/${message.author.username}`}
                    className="text-ink transition-colors hover:text-accent"
                  >
                    {author}
                  </a>
                  <span>{timeAgo(message.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                  {message.body}
                </p>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={value}
          placeholder="Reply"
          onChange={(event) => onChange(event.target.value)}
          className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
        />
        <button
          type="button"
          onClick={onReply}
          className="rounded-lg border border-line px-4 text-sm font-extrabold text-ink transition-colors hover:bg-control-hover"
        >
          Reply
        </button>
      </div>
    </article>
  );
}
