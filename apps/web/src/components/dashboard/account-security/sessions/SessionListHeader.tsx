export function SessionListHeader({
  onShowRevokedChange,
  shownCount,
  showRevoked,
  totalHits,
}: {
  onShowRevokedChange: (value: boolean) => void;
  shownCount: number;
  showRevoked: boolean;
  totalHits: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold text-muted">
        Showing {shownCount.toLocaleString('en-US')} of{' '}
        {totalHits.toLocaleString('en-US')}{' '}
        {showRevoked ? 'sessions' : 'active sessions'}
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
