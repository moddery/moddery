import { type ApiTokenSummary } from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { Pagination } from '../../../Pagination.tsx';

export function ApiTokenList({
  busyTokenId,
  error,
  onPage,
  onRevoke,
  onShowRevokedChange,
  page,
  showRevoked,
  tokens,
  totalHits,
  totalPages,
}: {
  busyTokenId: string | null;
  error: string | null;
  onPage: (page: number) => void;
  onRevoke: (tokenId: string) => Promise<void>;
  onShowRevokedChange: (value: boolean) => void;
  page: number;
  showRevoked: boolean;
  tokens: ApiTokenSummary[];
  totalHits: number;
  totalPages: number;
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
      <div className="mt-4 rounded-lg border border-line bg-surface px-3 py-3">
        <TokenListHeader
          showRevoked={showRevoked}
          shownCount={tokens.length}
          totalHits={totalHits}
          onShowRevokedChange={onShowRevokedChange}
        />
        <p className="mt-3 text-sm font-semibold text-muted">
          {showRevoked
            ? 'No personal access tokens.'
            : 'No active personal access tokens.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-2">
      <TokenListHeader
        showRevoked={showRevoked}
        shownCount={tokens.length}
        totalHits={totalHits}
        onShowRevokedChange={onShowRevokedChange}
      />
      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
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
              disabled={busyTokenId === token.id}
              onClick={() => void onRevoke(token.id)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyTokenId === token.id ? 'Revoking...' : 'Revoke'}
            </button>
          )}
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </div>
  );
}

function TokenListHeader({
  showRevoked,
  shownCount,
  totalHits,
  onShowRevokedChange,
}: {
  showRevoked: boolean;
  shownCount: number;
  totalHits: number;
  onShowRevokedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold text-muted">
        Showing {shownCount.toLocaleString('en-US')} of{' '}
        {totalHits.toLocaleString('en-US')}{' '}
        {showRevoked ? 'tokens' : 'active tokens'}
      </p>
      <button
        type="button"
        onClick={() => {
          onShowRevokedChange(!showRevoked);
        }}
        className="inline-flex h-8 items-center rounded-lg border border-line px-3 text-xs font-bold text-ink transition-colors hover:bg-control-hover"
      >
        {showRevoked ? 'Hide revoked' : 'Show revoked'}
      </button>
    </div>
  );
}
