import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import {
  type SessionSummary,
  fetchViewerSessionSearch,
  revokeSession,
} from '../../../lib/dashboard.ts';
import { SessionList } from './sessions/SessionList.tsx';

const pageSize = 20;

export function SessionsPanel() {
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showRevoked, setShowRevoked] = useState(false);
  const sessionsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerSessionSearch(showRevoked, page, pageSize, signal),
    queryKey: ['dashboard', 'sessions', showRevoked, page],
  });
  const sessions = sessionsQuery.data?.sessions ?? [];
  const totalHits = sessionsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));

  async function revoke(sessionId: string) {
    setBusySessionId(sessionId);
    setMessage(null);

    try {
      const session = await revokeSession(sessionId);
      setMessage(sessionActionMessage('revoke', session));
      await sessionsQuery.refetch();
      if (sessions.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Session revocation failed',
      );
    } finally {
      setBusySessionId(null);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Sessions
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Revoke browser sessions that should no longer have access.
          </p>
        </div>
        <ShieldCheck className="size-5 text-accent-icon" />
      </div>
      {message && (
        <p className="mt-3 text-sm font-semibold text-muted">{message}</p>
      )}
      <SessionList
        busySessionId={busySessionId}
        error={
          sessionsQuery.error instanceof Error
            ? sessionsQuery.error.message
            : null
        }
        onRevoke={revoke}
        onPage={setPage}
        onShowRevokedChange={(value) => {
          setPage(1);
          setShowRevoked(value);
        }}
        page={page}
        sessions={sessions}
        showRevoked={showRevoked}
        totalHits={totalHits}
        totalPages={totalPages}
      />
    </section>
  );
}

export function sessionActionMessage(
  action: 'revoke',
  session: Pick<SessionSummary, 'userAgent'>,
) {
  const label = session.userAgent ?? 'browser session';

  return `Revoked ${label}.`;
}
