import { type SessionSummary } from '../../../../lib/dashboard.ts';
import { Pagination } from '../../../Pagination.tsx';
import { SessionListHeader } from './SessionListHeader.tsx';
import { SessionRow } from './SessionRow.tsx';

export function SessionList({
  busySessionId,
  error,
  onPage,
  onRevoke,
  onShowRevokedChange,
  page,
  sessions,
  showRevoked,
  totalHits,
  totalPages,
}: {
  busySessionId: string | null;
  error: string | null;
  onPage: (page: number) => void;
  onRevoke: (sessionId: string) => Promise<void>;
  onShowRevokedChange: (value: boolean) => void;
  page: number;
  sessions: SessionSummary[];
  showRevoked: boolean;
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

  if (sessions.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-line bg-surface px-3 py-3">
        <SessionListHeader
          shownCount={sessions.length}
          showRevoked={showRevoked}
          totalHits={totalHits}
          onShowRevokedChange={onShowRevokedChange}
        />
        <p className="mt-3 text-sm font-semibold text-muted">
          {showRevoked ? 'No sessions.' : 'No active sessions.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-2">
      <SessionListHeader
        shownCount={sessions.length}
        showRevoked={showRevoked}
        totalHits={totalHits}
        onShowRevokedChange={onShowRevokedChange}
      />
      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
      {sessions.map((session) => (
        <SessionRow
          key={session.id}
          busy={busySessionId === session.id}
          session={session}
          onRevoke={onRevoke}
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
