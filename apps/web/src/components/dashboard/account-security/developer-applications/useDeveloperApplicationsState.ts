import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  createOAuthClient,
  fetchViewerOAuthClients,
  revokeOAuthClient,
} from '../../../../lib/dashboard.ts';
import { splitList } from '../shared.tsx';

interface PreventableSubmitEvent {
  preventDefault: () => void;
}

export function useDeveloperApplicationsState() {
  const [busy, setBusy] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [homepageUrl, setHomepageUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [redirectUris, setRedirectUris] = useState(
    'http://localhost:3000/callback',
  );
  const [scopes, setScopes] = useState('read:projects');
  const clientsQuery = useQuery({
    queryFn: ({ signal }) => fetchViewerOAuthClients(signal),
    queryKey: ['dashboard', 'oauth-clients'],
  });

  async function submit(event: PreventableSubmitEvent) {
    event.preventDefault();
    setBusy(true);
    setClientSecret(null);
    setMessage(null);

    try {
      const created = await createOAuthClient({
        description: nullableText(description),
        homepageUrl: nullableText(homepageUrl),
        name,
        redirectUris: splitList(redirectUris),
        scopes: splitList(scopes),
      });
      setClientSecret(created.clientSecret);
      setDescription('');
      setHomepageUrl('');
      setName('');
      await clientsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : 'Application creation failed',
      );
    } finally {
      setBusy(false);
    }
  }

  async function revoke(clientId: string) {
    setBusy(true);
    setMessage(null);

    try {
      await revokeOAuthClient(clientId);
      await clientsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Application revoke failed',
      );
    } finally {
      setBusy(false);
    }
  }

  return {
    busy,
    clientSecret,
    clients: clientsQuery.data ?? [],
    description,
    homepageUrl,
    isLoading: clientsQuery.isLoading,
    message,
    name,
    redirectUris,
    revoke,
    scopes,
    setDescription,
    setHomepageUrl,
    setName,
    setRedirectUris,
    setScopes,
    submit,
  };
}

export type DeveloperApplicationsState = ReturnType<
  typeof useDeveloperApplicationsState
>;

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
