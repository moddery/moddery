import { gql, useMutation, useQuery } from '@apollo/client';
import { useState, type FormEvent } from 'react';
import { Popover } from '@base-ui-components/react/popover';

import { apolloClient, authTokenStorageKey } from '../apollo.js';
import { cn } from '../lib/cn.ts';

const ME_QUERY = gql`
  query NavMe {
    me {
      username
      isAdmin
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation NavLogin($input: LoginInput!) {
    login(input: $input) {
      accessToken
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation NavRegister($input: RegisterInput!) {
    register(input: $input) {
      accessToken
    }
  }
`;

interface MeQueryData {
  me: {
    isAdmin: boolean;
    username: string;
  };
}

interface AuthMutationData {
  login?: {
    accessToken: string;
  };
  register?: {
    accessToken: string;
  };
}

type AuthMode = 'login' | 'register';

const controlButton =
  'inline-flex h-9 items-center rounded-lg bg-control px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover outline-none focus-visible:outline-none';
const fieldInput =
  'h-10 w-full rounded-md border border-line bg-control px-3 text-sm text-ink outline-none placeholder:text-faint transition-colors hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover';

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
  const [login, loginState] = useMutation<AuthMutationData>(LOGIN_MUTATION);
  const [register, registerState] =
    useMutation<AuthMutationData>(REGISTER_MUTATION);
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
      <div className="flex items-center gap-2">
        <span className="hidden text-sm font-semibold text-muted sm:inline">
          {data?.me.username ?? 'Signed in'}
          {data?.me.isAdmin ? ' · admin' : ''}
        </span>
        <button
          type="button"
          className={controlButton}
          onClick={() => void logout()}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <Popover.Trigger className={controlButton}>Sign in</Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          sideOffset={10}
          align="end"
          collisionPadding={12}
          className="z-50"
        >
          <Popover.Popup
            className={cn(
              'w-[calc(100vw-1.5rem)] max-w-xs origin-[var(--transform-origin)] rounded-xl border border-line bg-surface p-4 shadow-2xl outline-none',
              'transition-[opacity,transform] duration-150',
              'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
              'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            )}
          >
            <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-line bg-control p-1">
              <button
                type="button"
                className={cn(
                  'h-8 rounded-md text-sm font-bold transition-colors',
                  mode === 'login'
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-ink',
                )}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={cn(
                  'h-8 rounded-md text-sm font-bold transition-colors',
                  mode === 'register'
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-ink',
                )}
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>

            <form
              onSubmit={(event) => void submit(event)}
              className="space-y-2.5"
            >
              {mode === 'register' && (
                <>
                  <input
                    className={fieldInput}
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <input
                    className={fieldInput}
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </>
              )}

              {mode === 'login' && (
                <input
                  className={fieldInput}
                  placeholder="Username or email"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              )}

              <input
                className={fieldInput}
                placeholder="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {error && (
                <p className="text-xs font-semibold text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="h-10 w-full rounded-md bg-accent text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
