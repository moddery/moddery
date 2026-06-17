import { type OAuthClientSummary } from '../../../../lib/dashboard.ts';

export function DeveloperApplicationList({
  busy,
  clients,
  isLoading,
  revoke,
}: {
  busy: boolean;
  clients: OAuthClientSummary[];
  isLoading: boolean;
  revoke: (clientId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="mt-4 grid gap-3">
        <p className="text-sm text-muted">Loading applications...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="mt-4 grid gap-3">
        <p className="text-sm text-muted">No applications yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {clients.map((client) => (
        <article
          key={client.id}
          className="rounded-lg border border-line bg-surface p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-ink">{client.name}</h3>
              <p className="mt-1 text-xs font-semibold text-muted">
                {client.clientId}
              </p>
            </div>
            <button
              type="button"
              disabled={busy || client.status === 'REVOKED'}
              onClick={() => revoke(client.id)}
              className="rounded-lg border border-line px-3 py-2 text-sm font-extrabold text-ink transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {client.status === 'REVOKED' ? 'Revoked' : 'Revoke'}
            </button>
          </div>
          {client.description && (
            <p className="mt-2 text-sm text-muted">{client.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted">
            {client.redirectUris.map((redirectUri) => (
              <span
                key={redirectUri.id}
                className="rounded-md border border-line px-2 py-1"
              >
                {redirectUri.uri}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
