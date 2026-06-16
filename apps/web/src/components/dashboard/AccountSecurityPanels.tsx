import { useQuery } from '@tanstack/react-query';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import {
  createApiToken,
  fetchViewerApiTokens,
  fetchViewerSessions,
  revokeApiToken,
  revokeSession,
  type ApiTokenSummary,
  type SessionSummary,
} from '../../lib/dashboard.ts';
import { timeAgo } from '../../lib/format.ts';

export function AccountSecurityPanels() {
  return (
    <>
      <SessionsPanel />
      <ApiTokensPanel />
    </>
  );
}

function SessionsPanel() {
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

function ApiTokensPanel() {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState('read:projects');
  const [expiresInDays, setExpiresInDays] = useState('90');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const tokensQuery = useQuery({
    queryFn: ({ signal }) => fetchViewerApiTokens(signal),
    queryKey: ['dashboard', 'api-tokens'],
  });
  const tokens = tokensQuery.data ?? [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setCreatedToken(null);

    try {
      const created = await createApiToken({
        expiresInDays:
          expiresInDays.trim() === '' ? null : Number(expiresInDays),
        name,
        scopes: splitList(scopes),
      });
      setCreatedToken(created.token);
      setName('');
      await tokensQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'API token creation failed',
      );
    } finally {
      setBusy(false);
    }
  }

  async function revoke(tokenId: string) {
    setBusy(true);
    setMessage(null);

    try {
      await revokeApiToken(tokenId);
      await tokensQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : 'API token revocation failed',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Personal access tokens
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Create bearer tokens for local tools and automation.
          </p>
        </div>
        <KeyRound className="size-5 text-accent-icon" />
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
          <DashboardField
            label="Token name"
            value={name}
            onChange={setName}
            required
          />
          <DashboardField label="Scopes" value={scopes} onChange={setScopes} />
          <DashboardField
            label="Expires in days"
            value={expiresInDays}
            onChange={setExpiresInDays}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create token
          </button>
          {message && (
            <span className="text-sm font-semibold text-muted">{message}</span>
          )}
        </div>
      </form>

      {createdToken && (
        <div className="mt-4 rounded-lg border border-line bg-control p-3">
          <p className="text-sm font-bold text-ink">Copy this token now.</p>
          <code className="mt-2 block overflow-x-auto rounded-md bg-surface px-3 py-2 text-sm text-ink">
            {createdToken}
          </code>
        </div>
      )}

      <ApiTokenList
        busy={busy || tokensQuery.isFetching}
        error={
          tokensQuery.error instanceof Error ? tokensQuery.error.message : null
        }
        onRevoke={revoke}
        tokens={tokens}
      />
    </section>
  );
}

function ApiTokenList({
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

function DashboardField({
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      {label}
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
      />
    </label>
  );
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
