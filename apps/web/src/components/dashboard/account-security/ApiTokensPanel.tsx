import { useQuery } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import {
  type ApiTokenSummary,
  createApiToken,
  fetchViewerApiTokenSearch,
  revokeApiToken,
} from '../../../lib/dashboard.ts';
import { ApiTokenCreatedNotice } from './api-tokens/ApiTokenCreatedNotice.tsx';
import { ApiTokenCreateForm } from './api-tokens/ApiTokenCreateForm.tsx';
import { ApiTokenList } from './api-tokens/ApiTokenList.tsx';
import { type CredentialScope } from './shared.tsx';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';

const pageSize = 20;

export function ApiTokensPanel() {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<CredentialScope[]>(['read:projects']);
  const [expiresInDays, setExpiresInDays] = useState('90');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [revokingTokenId, setRevokingTokenId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showRevoked, setShowRevoked] = useState(false);
  const tokensQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerApiTokenSearch(showRevoked, page, pageSize, signal),
    queryKey: ['dashboard', 'api-tokens', showRevoked, page],
  });
  const tokens = tokensQuery.data?.tokens ?? [];
  const totalHits = tokensQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    setCreatedToken(null);

    try {
      const created = await createApiToken({
        expiresInDays: parseOptionalApiTokenExpiryDays(expiresInDays),
        name,
        scopes,
      });
      setCreatedToken(created.token);
      setMessage(apiTokenActionMessage('create', created.tokenSummary));
      setName('');
      setPage(1);
      await tokensQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'API token creation failed',
      );
    } finally {
      setCreating(false);
    }
  }

  async function revoke(tokenId: string) {
    setRevokingTokenId(tokenId);
    setMessage(null);
    setCreatedToken(null);

    try {
      const token = await revokeApiToken(tokenId);
      setMessage(apiTokenActionMessage('revoke', token));
      await tokensQuery.refetch();
      if (tokens.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : 'API token revocation failed',
      );
    } finally {
      setRevokingTokenId(null);
    }
  }

  return (
    <CollapsiblePanel
      title="Personal access tokens"
      description="Create bearer tokens for local tools and automation."
      action={<KeyRound className="size-5 text-accent-icon" />}
    >
      <ApiTokenCreateForm
        busy={creating}
        expiresInDays={expiresInDays}
        message={message}
        name={name}
        scopes={scopes}
        onExpiresInDaysChange={setExpiresInDays}
        onNameChange={setName}
        onScopesChange={setScopes}
        onSubmit={(event) => void submit(event)}
      />

      {createdToken && <ApiTokenCreatedNotice token={createdToken} />}

      <ApiTokenList
        busyTokenId={revokingTokenId}
        error={
          tokensQuery.error instanceof Error ? tokensQuery.error.message : null
        }
        onRevoke={revoke}
        onPage={setPage}
        onShowRevokedChange={(value) => {
          setPage(1);
          setShowRevoked(value);
        }}
        page={page}
        showRevoked={showRevoked}
        tokens={tokens}
        totalHits={totalHits}
        totalPages={totalPages}
      />
    </CollapsiblePanel>
  );
}

export function apiTokenActionMessage(
  action: 'create' | 'revoke',
  token: Pick<ApiTokenSummary, 'name'>,
) {
  return action === 'create'
    ? `Created token ${token.name}.`
    : `Revoked token ${token.name}.`;
}

export function parseOptionalApiTokenExpiryDays(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (!/^\d+$/.test(trimmed)) {
    throw new Error('Token expiration must be a whole number of days');
  }

  const days = Number.parseInt(trimmed, 10);
  if (days < 1) {
    throw new Error('Token expiration must be at least 1 day');
  }

  return days;
}
