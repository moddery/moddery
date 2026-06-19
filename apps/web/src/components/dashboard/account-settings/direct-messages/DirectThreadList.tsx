import { type DirectThread } from '../../../../lib/dashboard/types.ts';
import { Pagination } from '../../../Pagination.tsx';
import { DirectThreadRow } from './DirectThreadRow.tsx';

export function DirectThreadList({
  busyThreadId,
  loading,
  messageBodyByThread,
  onMessageChange,
  onPage,
  onRead,
  onReply,
  page,
  threads,
  totalPages,
  viewerId,
}: {
  busyThreadId: string | null;
  loading: boolean;
  messageBodyByThread: Record<string, string>;
  onMessageChange: (threadId: string, value: string) => void;
  onPage: (page: number) => void;
  onRead: (threadId: string) => void;
  onReply: (threadId: string) => void;
  page: number;
  threads: DirectThread[];
  totalPages: number;
  viewerId: string;
}) {
  if (loading) {
    return (
      <div className="mt-4 grid gap-3">
        <p className="text-sm text-muted">Loading messages...</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="mt-4 grid gap-3">
        <p className="text-sm text-muted">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
      {threads.map((thread) => (
        <DirectThreadRow
          key={thread.id}
          busy={busyThreadId === thread.id}
          thread={thread}
          value={messageBodyByThread[thread.id] ?? ''}
          viewerId={viewerId}
          onChange={(value) => onMessageChange(thread.id, value)}
          onRead={() => onRead(thread.id)}
          onReply={() => onReply(thread.id)}
        />
      ))}
      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </div>
  );
}
