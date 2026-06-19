import { ExternalLink } from 'lucide-react';

import { type OAuthClientSummary } from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { enumLabel } from '../../../../lib/labels.ts';
import {
  oauthClientIdLabel,
  oauthClientRevoked,
  redirectUriLabel,
} from './developer-application-labels.ts';

export function DeveloperApplicationRow({
  busy,
  client,
  revoke,
}: {
  busy: boolean;
  client: OAuthClientSummary;
  revoke: (clientId: string) => void;
}) {
  const revoked = oauthClientRevoked(client);

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-ink">{client.name}</h3>
            <ApplicationStatusBadge client={client} />
          </div>
          <p className="mt-1 text-xs font-semibold text-muted">
            {oauthClientIdLabel(client.clientId)}
          </p>
        </div>
        <button
          type="button"
          disabled={busy || revoked}
          onClick={() => revoke(client.id)}
          className="rounded-lg border border-line px-3 py-2 text-sm font-extrabold text-ink transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {revoked ? 'Revoked' : busy ? 'Revoking...' : 'Revoke'}
        </button>
      </div>
      {client.description && (
        <p className="mt-2 text-sm text-muted">{client.description}</p>
      )}
      <div className="mt-3 grid gap-3">
        <ApplicationMetadata client={client} />
        <ApplicationScopes scopes={client.scopes} />
        <RedirectUriList redirectUris={client.redirectUris} />
      </div>
    </article>
  );
}

function ApplicationStatusBadge({ client }: { client: OAuthClientSummary }) {
  const revoked = oauthClientRevoked(client);

  return (
    <span
      className={
        revoked
          ? 'rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted'
          : 'rounded-md bg-accent-soft px-2 py-1 text-xs font-bold uppercase text-accent'
      }
    >
      {enumLabel(client.status)}
    </span>
  );
}

function ApplicationMetadata({ client }: { client: OAuthClientSummary }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-muted">
      <span>Created {timeAgo(client.createdAt)}</span>
      <span>Updated {timeAgo(client.updatedAt)}</span>
      {client.revokedAt && <span>Revoked {timeAgo(client.revokedAt)}</span>}
      {client.homepageUrl && (
        <a
          href={client.homepageUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-ink transition-colors hover:text-accent"
        >
          Homepage
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </div>
  );
}

function ApplicationScopes({ scopes }: { scopes: string[] }) {
  if (scopes.length === 0) {
    return (
      <p className="text-xs font-semibold text-muted">No scopes requested.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {scopes.map((scope) => (
        <span
          key={scope}
          className="rounded-md bg-surface-2 px-2 py-1 text-xs font-bold text-muted"
        >
          {scope}
        </span>
      ))}
    </div>
  );
}

function RedirectUriList({
  redirectUris,
}: {
  redirectUris: OAuthClientSummary['redirectUris'];
}) {
  if (redirectUris.length === 0) {
    return (
      <p className="text-xs font-semibold text-muted">
        No redirect URIs registered.
      </p>
    );
  }

  return (
    <div className="grid gap-1.5 text-xs font-semibold text-muted">
      {redirectUris.map((redirectUri) => (
        <div
          key={redirectUri.id}
          className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-line px-2 py-1"
          title={redirectUri.uri}
        >
          <span className="min-w-0 truncate text-ink">{redirectUri.uri}</span>
          <span className="text-faint">{redirectUriLabel(redirectUri)}</span>
        </div>
      ))}
    </div>
  );
}
