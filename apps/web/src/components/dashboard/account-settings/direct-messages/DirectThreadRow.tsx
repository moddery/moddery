import { userPath } from '../../../../app/routing.ts';
import { type DirectThread } from '../../../../lib/dashboard/types.ts';
import { timeAgo } from '../../../../lib/format.ts';

export function DirectThreadRow({
  onChange,
  onRead,
  onReply,
  thread,
  value,
  viewerId,
}: {
  onChange: (value: string) => void;
  onRead: () => void;
  onReply: () => void;
  thread: DirectThread;
  value: string;
  viewerId: string;
}) {
  const messages = [...thread.messages].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <ThreadHeader thread={thread} viewerId={viewerId} onRead={onRead} />
      <ThreadMessages messages={messages} />
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

function ThreadHeader({
  onRead,
  thread,
  viewerId,
}: {
  onRead: () => void;
  thread: DirectThread;
  viewerId: string;
}) {
  const unreadCount = directThreadUnreadCount(thread, viewerId);

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div className="min-w-0">
        <h3 className="truncate font-display text-base font-extrabold text-ink">
          {thread.subject}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {thread.members.map((member) => {
            const name = member.user.displayName ?? member.user.username;

            return (
              <a
                key={member.user.id}
                href={userPath(member.user.username)}
                className="font-bold text-ink transition-colors hover:text-accent"
              >
                {name}
              </a>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-muted sm:justify-end">
        {unreadCount > 0 && (
          <>
            <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-1 text-accent-icon">
              {unreadCount.toLocaleString('en-US')} unread
            </span>
            <button
              type="button"
              onClick={onRead}
              className="rounded-full border border-line px-2 py-1 text-ink transition-colors hover:bg-control-hover"
            >
              Mark read
            </button>
          </>
        )}
        <span>{directThreadTiming(thread)}</span>
      </div>
    </div>
  );
}

export function directThreadTiming(
  thread: Pick<DirectThread, 'createdAt' | 'updatedAt'>,
  now = new Date(),
) {
  return `Opened ${timeAgo(thread.createdAt, now)} · updated ${timeAgo(
    thread.updatedAt,
    now,
  )}`;
}

export function directThreadUnreadCount(
  thread: Pick<DirectThread, 'members' | 'messages'>,
  viewerId: string,
) {
  const viewerMember = thread.members.find(
    (member) => member.user.id === viewerId,
  );
  const lastReadAt =
    viewerMember?.lastReadAt === null || viewerMember?.lastReadAt === undefined
      ? null
      : new Date(viewerMember.lastReadAt).getTime();

  return thread.messages.filter((message) => {
    if (message.author.id === viewerId) return false;

    const messageCreatedAt = new Date(message.createdAt).getTime();
    return lastReadAt === null || messageCreatedAt > lastReadAt;
  }).length;
}

function ThreadMessages({ messages }: { messages: DirectThread['messages'] }) {
  return (
    <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto pr-1">
      {messages.length === 0 ? (
        <p className="text-sm text-muted">No messages in this thread.</p>
      ) : (
        messages.map((message) => {
          const author = message.author.displayName ?? message.author.username;

          return (
            <div
              key={message.id}
              className="rounded-md border border-line bg-surface-2 px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted">
                <a
                  href={userPath(message.author.username)}
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
  );
}
