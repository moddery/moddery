import { useQuery } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import {
  createApiToken,
  fetchViewerApiTokens,
  revokeApiToken,
} from '../../../lib/dashboard.ts';
import { ApiTokenCreatedNotice } from './api-tokens/ApiTokenCreatedNotice.tsx';
import { ApiTokenCreateForm } from './api-tokens/ApiTokenCreateForm.tsx';
import { ApiTokenList } from './api-tokens/ApiTokenList.tsx';
import { splitList } from './shared.tsx';

export function ApiTokensPanel() {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState('read:projects');
  const [expiresInDays, setExpiresInDays] = useState('90');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showRevoked, setShowRevoked] = useState(false);
  const tokensQuery = useQuery({
    queryFn: ({ signal }) => fetchViewerApiTokens(showRevoked, signal),
    queryKey: ['dashboard', 'api-tokens', showRevoked],
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

      <ApiTokenCreateForm
        busy={busy}
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
        busy={busy || tokensQuery.isFetching}
        error={
          tokensQuery.error instanceof Error ? tokensQuery.error.message : null
        }
        onRevoke={revoke}
        onShowRevokedChange={setShowRevoked}
        showRevoked={showRevoked}
        tokens={tokens}
      />
    </section>
  );
}
