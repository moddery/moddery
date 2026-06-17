import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import {
  fetchViewerSessions,
  revokeSession,
  type SessionSummary,
} from '../../../lib/dashboard.ts';
import { timeAgo } from '../../../lib/format.ts';

export function SessionsPanel() {
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const sessionsQuery = useQuery({
    queryFn: ({ signal }) => fetchViewerSessions(signal),
    queryKey: ['dashboard', 'sessions'],
  });
  const sessions = sessionsQuery.data ?? [];

  async function revoke(sessionId: string) {
    setBusySessionId(sessionId);
    setMessage(null);

    try {
      await revokeSession(sessionId);
      await sessionsQuery.refetch();
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
        sessions={sessions}
      />
    </section>
  );
}

function SessionList({
  busySessionId,
  error,
  onRevoke,
  sessions,
}: {
  busySessionId: string | null;
  error: string | null;
  onRevoke: (sessionId: string) => Promise<void>;
  sessions: SessionSummary[];
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
      <p className="mt-4 text-sm font-semibold text-muted">
        No active sessions.
      </p>
    );
  }

  return (
    <div className="mt-4 grid gap-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-display text-base font-extrabold text-ink">
              {session.userAgent ?? 'Browser session'}
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">
              Created {timeAgo(session.createdAt)} · used{' '}
              {timeAgo(session.lastUsedAt)} · expires{' '}
              {timeAgo(session.expiresAt)}
            </p>
          </div>
          {session.revokedAt ? (
            <span className="text-sm font-bold text-muted">
              Revoked {timeAgo(session.revokedAt)}
            </span>
          ) : (
            <button
              type="button"
              disabled={busySessionId === session.id}
              onClick={() => void onRevoke(session.id)}
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
