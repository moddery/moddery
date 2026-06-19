import { type SessionSummary } from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';

export function SessionRow({
  busy,
  onRevoke,
  session,
}: {
  busy: boolean;
  onRevoke: (sessionId: string) => Promise<void>;
  session: SessionSummary;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-display text-base font-extrabold text-ink">
          {session.userAgent ?? 'Browser session'}
          {session.isCurrent && (
            <span className="ml-2 rounded-md bg-control px-2 py-1 align-middle text-xs font-extrabold text-muted">
              Current
            </span>
          )}
        </p>
        <p className="mt-1 text-sm font-semibold text-muted">
          Created {timeAgo(session.createdAt)} · used{' '}
          {timeAgo(session.lastUsedAt)} · expires {timeAgo(session.expiresAt)}
        </p>
      </div>
      {session.revokedAt ? (
        <span className="text-sm font-bold text-muted">
          Revoked {timeAgo(session.revokedAt)}
        </span>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void onRevoke(session.id)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Revoking...' : 'Revoke'}
        </button>
      )}
    </div>
  );
}
