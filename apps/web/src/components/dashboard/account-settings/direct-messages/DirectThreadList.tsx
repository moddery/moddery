import { type DirectThread } from '../../../../lib/dashboard/types.ts';
import { Pagination } from '../../../Pagination.tsx';
import { DirectThreadRow } from './DirectThreadRow.tsx';

export function DirectThreadList({
  loading,
  messageBodyByThread,
  onMessageChange,
  onPage,
  onReply,
  page,
  threads,
  totalPages,
}: {
  loading: boolean;
  messageBodyByThread: Record<string, string>;
  onMessageChange: (threadId: string, value: string) => void;
  onPage: (page: number) => void;
  onReply: (threadId: string) => void;
  page: number;
  threads: DirectThread[];
  totalPages: number;
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
          thread={thread}
          value={messageBodyByThread[thread.id] ?? ''}
          onChange={(value) => onMessageChange(thread.id, value)}
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
