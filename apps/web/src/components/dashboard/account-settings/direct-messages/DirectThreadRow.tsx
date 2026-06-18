import { userPath } from '../../../../app/routing.ts';
import { type DirectThread } from '../../../../lib/dashboard/types.ts';
import { timeAgo } from '../../../../lib/format.ts';

export function DirectThreadRow({
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
      <ThreadHeader thread={thread} />
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

function ThreadHeader({ thread }: { thread: DirectThread }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
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
      <span className="text-xs font-semibold uppercase text-muted">
        Updated {timeAgo(thread.updatedAt)}
      </span>
    </div>
  );
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
