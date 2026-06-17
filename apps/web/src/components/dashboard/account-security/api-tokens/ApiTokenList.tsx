import { type ApiTokenSummary } from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';

export function ApiTokenList({
  busy,
  error,
  onRevoke,
  tokens,
}: {
  busy: boolean;
  error: string | null;
  onRevoke: (tokenId: string) => Promise<void>;
  tokens: ApiTokenSummary[];
}) {
  if (error) {
    return (
      <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
        {error}
      </p>
    );
  }

  if (tokens.length === 0) {
    return (
      <p className="mt-4 text-sm font-semibold text-muted">
        No personal access tokens.
      </p>
    );
  }

  return (
    <div className="mt-4 grid gap-2">
      {tokens.map((token) => (
        <div
          key={token.id}
          className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-display text-base font-extrabold text-ink">
              {token.name}
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">
              {token.scopes.length > 0 ? token.scopes.join(', ') : 'No scopes'}{' '}
              · created {timeAgo(token.createdAt)}
              {token.lastUsedAt ? ` · used ${timeAgo(token.lastUsedAt)}` : ''}
              {token.expiresAt ? ` · expires ${timeAgo(token.expiresAt)}` : ''}
            </p>
          </div>
          {token.revokedAt ? (
            <span className="text-sm font-bold text-muted">
              Revoked {timeAgo(token.revokedAt)}
            </span>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onRevoke(token.id)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Revoke
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
