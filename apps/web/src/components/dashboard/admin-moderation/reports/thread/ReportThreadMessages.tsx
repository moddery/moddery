import { type ReportThread } from '../../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../../lib/format.ts';

export function ReportThreadMessages({ thread }: { thread: ReportThread }) {
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
              <a
                href={`/users/${message.author.username}`}
                className="text-ink transition-colors hover:text-accent"
              >
                {author}
              </a>{' '}
              · {timeAgo(message.createdAt)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
