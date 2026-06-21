import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { apolloClient, clearStoredAuthToken } from '../../../apollo.js';
import {
  type SessionSummary,
  fetchViewerSessionSearch,
  revokeSession,
} from '../../../lib/dashboard.ts';
import { SessionList } from './sessions/SessionList.tsx';
import { DashboardPanel, SectionHeader } from '../../ui/dashboard/index.ts';

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
      if (session.isCurrent) {
        clearStoredAuthToken();
        await apolloClient.clearStore();
        return;
      }
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
    <DashboardPanel>
      <SectionHeader
        title="Sessions"
        description="Revoke browser sessions that should no longer have access."
        action={<ShieldCheck className="size-5 text-accent-icon" />}
      />
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
    </DashboardPanel>
  );
}

export function sessionActionMessage(
  action: 'revoke',
  session: Pick<SessionSummary, 'isCurrent' | 'userAgent'>,
) {
  const label = session.userAgent ?? 'browser session';

  return session.isCurrent
    ? `Revoked current ${label}. Sign in again to continue.`
    : `Revoked ${label}.`;
}
