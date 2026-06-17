import { type ReportThread } from '../../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../../lib/format.ts';

export function ReportThreadMembers({ thread }: { thread: ReportThread }) {
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
          <a
            key={member.user.id}
            href={`/users/${member.user.username}`}
            className="rounded-md border border-line bg-control px-2.5 py-1.5"
          >
            <p className="text-xs font-extrabold text-ink">{name}</p>
            <p className="text-[11px] font-bold text-muted">{readState}</p>
          </a>
        );
      })}
    </div>
  );
}
