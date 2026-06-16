import { gql, useMutation, useQuery } from '@apollo/client';
import type { ProjectSummaryContract } from '@moddery/shared';
import type React from 'react';
import { useState } from 'react';

import { apolloClient, authTokenStorageKey } from './apollo.js';

const AUTHENTICATED_HOME_QUERY = gql`
  query AuthenticatedHome {
    me {
      id
      username
      displayName
      isAdmin
      role
    }
    projects {
      id
      slug
      title
      summary
      kind
      status
      downloads
      updatedAt
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      expiresIn
      tokenType
      user {
        id
        username
        displayName
        isAdmin
        role
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      expiresIn
      tokenType
      user {
        id
        username
        displayName
        isAdmin
        role
      }
    }
  }
`;

interface AuthUser {
  readonly displayName: string | null;
  readonly id: string;
  readonly isAdmin: boolean;
  readonly role: string;
  readonly username: string;
}

interface AuthPayload {
  readonly accessToken: string;
  readonly expiresIn: number;
  readonly tokenType: 'Bearer';
  readonly user: AuthUser;
}

interface AuthenticatedHomeQueryData {
  readonly me: AuthUser;
  readonly projects: readonly ProjectSummaryContract[];
}

interface LoginMutationData {
  readonly login: AuthPayload;
}

interface LoginMutationVariables {
  readonly input: {
    readonly identifier: string;
    readonly password: string;
  };
}

interface RegisterMutationData {
  readonly register: AuthPayload;
}

interface RegisterMutationVariables {
  readonly input: {
    readonly displayName?: string;
    readonly email: string;
    readonly password: string;
    readonly username: string;
  };
}

type AuthMode = 'login' | 'register';

const buttonClassName =
  'rounded border border-slate-900 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50';
const fieldClassName =
  'rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900';
const labelClassName = 'text-sm font-medium';
const mainClassName =
  'mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-10 text-slate-950';

export function App(): React.ReactElement {
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem(authTokenStorageKey),
  );
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data, error, loading, refetch } =
    useQuery<AuthenticatedHomeQueryData>(AUTHENTICATED_HOME_QUERY, {
      skip: !accessToken,
    });

  const [login, { loading: loginLoading }] = useMutation<
    LoginMutationData,
    LoginMutationVariables
  >(LOGIN_MUTATION);
  const [register, { loading: registerLoading }] = useMutation<
    RegisterMutationData,
    RegisterMutationVariables
  >(REGISTER_MUTATION);

  async function persistSession(payload: AuthPayload): Promise<void> {
    localStorage.setItem(authTokenStorageKey, payload.accessToken);
    setAccessToken(payload.accessToken);
    setFormError(null);
    await apolloClient.resetStore();
  }

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFormError(null);

    try {
      const result = await login({
        variables: {
          input: {
            identifier,
            password,
          },
        },
      });

      if (!result.data) {
        setFormError('Login did not return a session.');
        return;
      }

      await persistSession(result.data.login);
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Login failed.',
      );
    }
  }

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFormError(null);

    try {
      const result = await register({
        variables: {
          input: {
            ...(displayName ? { displayName } : {}),
            email,
            password,
            username,
          },
        },
      });

      if (!result.data) {
        setFormError('Registration did not return a session.');
        return;
      }

      await persistSession(result.data.register);
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Registration failed.',
      );
    }
  }

  async function handleLogout(): Promise<void> {
    localStorage.removeItem(authTokenStorageKey);
    setAccessToken(null);
    setFormError(null);
    await apolloClient.clearStore();
  }

  if (!accessToken) {
    const submitting = loginLoading || registerLoading;

    return (
      <main className={mainClassName}>
        <header>
          <h1 className="text-2xl font-semibold">Hello world</h1>
          <p className="mt-1 text-sm text-slate-600">GraphQL auth</p>
        </header>

        <div className="flex gap-2">
          <button
            className={`${buttonClassName} ${
              authMode === 'login' ? 'bg-slate-900 text-white' : 'bg-white'
            }`}
            type="button"
            onClick={() => setAuthMode('login')}
          >
            Login
          </button>
          <button
            className={`${buttonClassName} ${
              authMode === 'register' ? 'bg-slate-900 text-white' : 'bg-white'
            }`}
            type="button"
            onClick={() => setAuthMode('register')}
          >
            Register
          </button>
        </div>

        {authMode === 'login' ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => void handleLogin(event)}
          >
            <label className={labelClassName} htmlFor="login-identifier">
              Username or email
            </label>
            <input
              className={fieldClassName}
              id="login-identifier"
              name="identifier"
              onChange={(event) => setIdentifier(event.target.value)}
              required
              type="text"
              value={identifier}
            />

            <label className={labelClassName} htmlFor="login-password">
              Password
            </label>
            <input
              className={fieldClassName}
              id="login-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />

            <button
              className={`${buttonClassName} mt-2 bg-slate-900 text-white`}
              disabled={submitting}
              type="submit"
            >
              Login
            </button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => void handleRegister(event)}
          >
            <label className={labelClassName} htmlFor="register-email">
              Email
            </label>
            <input
              className={fieldClassName}
              id="register-email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />

            <label className={labelClassName} htmlFor="register-username">
              Username
            </label>
            <input
              className={fieldClassName}
              id="register-username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              type="text"
              value={username}
            />

            <label className={labelClassName} htmlFor="register-display-name">
              Display name
            </label>
            <input
              className={fieldClassName}
              id="register-display-name"
              name="displayName"
              onChange={(event) => setDisplayName(event.target.value)}
              type="text"
              value={displayName}
            />

            <label className={labelClassName} htmlFor="register-password">
              Password
            </label>
            <input
              className={fieldClassName}
              id="register-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />

            <button
              className={`${buttonClassName} mt-2 bg-slate-900 text-white`}
              disabled={submitting}
              type="submit"
            >
              Register
            </button>
          </form>
        )}

        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
      </main>
    );
  }

  const firstProject = data?.projects[0];

  return (
    <main className={mainClassName}>
      <header>
        <h1 className="text-2xl font-semibold">Hello world</h1>
      </header>

      <div className="flex gap-2">
        <button
          className={buttonClassName}
          type="button"
          onClick={() => void handleLogout()}
        >
          Logout
        </button>
        <button
          className={buttonClassName}
          type="button"
          onClick={() => void refetch()}
        >
          Refetch GraphQL
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">
          Loading authenticated GraphQL...
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error.message}</p> : null}

      {data ? (
        <section className="border-t border-slate-200 pt-4">
          <p>
            Signed in as {data.me.displayName ?? data.me.username} (
            {data.me.isAdmin ? 'admin' : 'non-admin'}, {data.me.role})
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {firstProject?.title ?? 'No projects yet'}
          </p>
        </section>
      ) : null}
    </main>
  );
}
