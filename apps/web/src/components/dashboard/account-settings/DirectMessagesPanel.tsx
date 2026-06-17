import { useQuery } from '@tanstack/react-query';
import { type FormEvent } from 'react';
import { useState } from 'react';

import {
  createDirectThread,
  createDirectThreadMessage,
  fetchViewerDirectThreads,
} from '../../../lib/dashboard/actions/account.ts';
import { DirectMessageComposer } from './direct-messages/DirectMessageComposer.tsx';
import { DirectThreadList } from './direct-messages/DirectThreadList.tsx';

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

      <DirectMessageComposer
        body={body}
        username={username}
        onBodyChange={setBody}
        onSubmit={startThread}
        onUsernameChange={setUsername}
      />

      <DirectThreadList
        loading={threadsQuery.isLoading}
        messageBodyByThread={messageBodyByThread}
        page={page}
        threads={threads}
        totalPages={totalPages}
        onMessageChange={(threadId, value) =>
          setMessageBodyByThread((current) => ({
            ...current,
            [threadId]: value,
          }))
        }
        onPage={setPage}
        onReply={(threadId) => void replyToThread(threadId)}
      />
    </section>
  );
}
