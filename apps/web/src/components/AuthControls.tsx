import { useMutation, useQuery } from '@apollo/client';
import { useState, type FormEvent } from 'react';

import { apolloClient, authTokenStorageKey } from '../apollo.js';
import { AuthPopover } from './auth-controls/AuthPopover.tsx';
import {
  LOGIN_MUTATION,
  MARK_NOTIFICATION_READ_MUTATION,
  ME_QUERY,
  NOTIFICATIONS_QUERY,
  REGISTER_MUTATION,
} from './auth-controls/graphql.ts';
import { SignedInControls } from './auth-controls/SignedInControls.tsx';
import {
  type AuthMode,
  type AuthMutationData,
  type MeQueryData,
  type NotificationsQueryData,
} from './auth-controls/types.ts';

export function AuthControls() {
  const [token, setToken] = useState(() =>
    localStorage.getItem(authTokenStorageKey),
  );
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { data } = useQuery<MeQueryData>(ME_QUERY, { skip: token === null });
  const notificationsQuery = useQuery<NotificationsQueryData>(
    NOTIFICATIONS_QUERY,
    {
      skip: token === null,
    },
  );
  const [login, loginState] = useMutation<AuthMutationData>(LOGIN_MUTATION);
  const [register, registerState] =
    useMutation<AuthMutationData>(REGISTER_MUTATION);
  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION);
  const busy = loginState.loading || registerState.loading;

  async function saveToken(accessToken: string): Promise<void> {
    localStorage.setItem(authTokenStorageKey, accessToken);
    setToken(accessToken);
    setOpen(false);
    setError(null);
    await apolloClient.resetStore();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const result =
        mode === 'login'
          ? await login({
              variables: { input: { identifier, password } },
            })
          : await register({
              variables: { input: { email, password, username } },
            });
      const accessToken =
        mode === 'login'
          ? result.data?.login?.accessToken
          : result.data?.register?.accessToken;

      if (!accessToken)
        throw new Error('Authentication did not return a token');
      await saveToken(accessToken);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Authentication failed',
      );
    }
  }

  async function logout(): Promise<void> {
    localStorage.removeItem(authTokenStorageKey);
    setToken(null);
    await apolloClient.clearStore();
  }

  if (token !== null) {
    return (
      <SignedInControls
        isAdmin={data?.me.isAdmin}
        notificationCount={
          notificationsQuery.data?.unreadNotificationCount ?? 0
        }
        notifications={notificationsQuery.data?.viewerNotifications ?? []}
        onLogout={logout}
        onNotificationRead={async (id) => {
          await markNotificationRead({ variables: { id } });
          await notificationsQuery.refetch();
        }}
        username={data?.me.username}
      />
    );
  }

  return (
    <AuthPopover
      busy={busy}
      email={email}
      error={error}
      identifier={identifier}
      mode={mode}
      onEmailChange={setEmail}
      onIdentifierChange={setIdentifier}
      onModeChange={setMode}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
      onPasswordChange={setPassword}
      onSubmit={(event) => void submit(event)}
      onUsernameChange={setUsername}
      open={open}
      password={password}
      username={username}
    />
  );
}
