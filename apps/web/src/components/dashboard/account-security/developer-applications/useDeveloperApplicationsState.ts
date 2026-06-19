import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  type OAuthClientSummary,
  createOAuthClient,
  fetchViewerOAuthClientSearch,
  revokeOAuthClient,
} from '../../../../lib/dashboard.ts';
import { type CredentialScope, splitList } from '../shared.tsx';

interface PreventableSubmitEvent {
  preventDefault: () => void;
}

export function useDeveloperApplicationsState() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [description, setDescription] = useState('');
  const [homepageUrl, setHomepageUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [redirectUris, setRedirectUris] = useState(
    'http://localhost:3000/callback',
  );
  const [revokingClientId, setRevokingClientId] = useState<string | null>(null);
  const [scopes, setScopes] = useState<CredentialScope[]>(['read:projects']);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const clientsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerOAuthClientSearch(page, pageSize, signal),
    queryKey: ['dashboard', 'oauth-clients', page],
  });
  const clients = clientsQuery.data?.clients ?? [];

  async function submit(event: PreventableSubmitEvent) {
    event.preventDefault();
    setCreating(true);
    setClientSecret(null);
    setMessage(null);

    try {
      const created = await createOAuthClient({
        description: nullableText(description),
        homepageUrl: nullableText(homepageUrl),
        name,
        redirectUris: splitList(redirectUris),
        scopes,
      });
      setClientSecret(created.clientSecret);
      setMessage(developerApplicationActionMessage('create', created.client));
      setDescription('');
      setHomepageUrl('');
      setName('');
      setPage(1);
      await clientsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : 'Application creation failed',
      );
    } finally {
      setCreating(false);
    }
  }

  async function revoke(clientId: string) {
    setRevokingClientId(clientId);
    setMessage(null);
    setClientSecret(null);

    try {
      const client = await revokeOAuthClient(clientId);
      setMessage(developerApplicationActionMessage('revoke', client));
      await clientsQuery.refetch();
      if (clients.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Application revoke failed',
      );
    } finally {
      setRevokingClientId(null);
    }
  }

  return {
    clientSecret,
    clients,
    creating,
    description,
    homepageUrl,
    isLoading: clientsQuery.isLoading,
    message,
    name,
    page,
    pageSize,
    redirectUris,
    revokingClientId,
    revoke,
    scopes,
    setDescription,
    setHomepageUrl,
    setName,
    setPage,
    setRedirectUris,
    setScopes,
    submit,
    totalHits: clientsQuery.data?.totalHits ?? 0,
  };
}

export type DeveloperApplicationsState = ReturnType<
  typeof useDeveloperApplicationsState
>;

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function developerApplicationActionMessage(
  action: 'create' | 'revoke',
  client: Pick<OAuthClientSummary, 'name'>,
) {
  return action === 'create'
    ? `Created application ${client.name}.`
    : `Revoked application ${client.name}.`;
}
