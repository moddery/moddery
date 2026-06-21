import { useQuery } from '@tanstack/react-query';
import { type FormEvent } from 'react';
import { useState } from 'react';

import {
  createDirectThread,
  createDirectThreadMessage,
  fetchViewerDirectThreads,
  markDirectThreadRead,
} from '../../../lib/dashboard/actions/account.ts';
import { type DirectThread } from '../../../lib/dashboard/types.ts';
import { DashboardPanel, SectionHeader } from '../../ui/dashboard/index.ts';
import { DirectMessageComposer } from './direct-messages/DirectMessageComposer.tsx';
import { DirectThreadList } from './direct-messages/DirectThreadList.tsx';

const pageSize = 20;

export function DirectMessagesPanel({ viewerId }: { viewerId: string }) {
  const [body, setBody] = useState('');
  const [composerSubmitting, setComposerSubmitting] = useState(false);
  const [busyThreadId, setBusyThreadId] = useState<string | null>(null);
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
    setComposerSubmitting(true);

    try {
      const thread = await createDirectThread({
        body: body.trim(),
        username: username.trim(),
      });
      setBody('');
      setUsername('');
      setPage(1);
      setStatus(directMessageStatusMessage('create', thread));
      await threadsQuery.refetch();
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Message failed');
    } finally {
      setComposerSubmitting(false);
    }
  }

  async function replyToThread(threadId: string) {
    const body = messageBodyByThread[threadId]?.trim() ?? '';
    if (body.length === 0) {
      return;
    }

    setStatus(null);
    setBusyThreadId(threadId);

    try {
      const thread = await createDirectThreadMessage({ body, threadId });
      setMessageBodyByThread((current) => ({ ...current, [threadId]: '' }));
      setStatus(directMessageStatusMessage('reply', thread));
      await threadsQuery.refetch();
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Message failed');
    } finally {
      setBusyThreadId(null);
    }
  }

  async function markThreadRead(threadId: string) {
    setStatus(null);
    setBusyThreadId(threadId);

    try {
      const thread = await markDirectThreadRead(threadId);
      setStatus(directMessageStatusMessage('read', thread));
      await threadsQuery.refetch();
    } catch (caught) {
      setStatus(
        caught instanceof Error ? caught.message : 'Read update failed',
      );
    } finally {
      setBusyThreadId(null);
    }
  }

  const threads = threadsQuery.data?.threads ?? [];
  const totalHits = threadsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));

  return (
    <div id="dashboard-messages" className="scroll-mt-32">
      <DashboardPanel>
        <SectionHeader
          title="Messages"
          description={
            threadsQuery.data
              ? `${totalHits.toLocaleString('en-US')} direct threads`
              : 'Send direct messages to other users.'
          }
          action={
            status ? (
              <span className="text-sm font-semibold text-muted">{status}</span>
            ) : undefined
          }
        />

        <DirectMessageComposer
          body={body}
          submitting={composerSubmitting}
          username={username}
          onBodyChange={setBody}
          onSubmit={startThread}
          onUsernameChange={setUsername}
        />

        <DirectThreadList
          busyThreadId={busyThreadId}
          loading={threadsQuery.isLoading}
          messageBodyByThread={messageBodyByThread}
          page={page}
          threads={threads}
          totalPages={totalPages}
          viewerId={viewerId}
          onMessageChange={(threadId, value) =>
            setMessageBodyByThread((current) => ({
              ...current,
              [threadId]: value,
            }))
          }
          onPage={setPage}
          onRead={(threadId) => void markThreadRead(threadId)}
          onReply={(threadId) => void replyToThread(threadId)}
        />
      </DashboardPanel>
    </div>
  );
}

export function directMessageStatusMessage(
  action: 'create' | 'read' | 'reply',
  thread: Pick<DirectThread, 'subject'>,
) {
  switch (action) {
    case 'create':
      return `Started ${thread.subject}.`;
    case 'reply':
      return `Replied to ${thread.subject}.`;
    case 'read':
      return `Marked ${thread.subject} as read.`;
  }
}
