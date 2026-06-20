import { afterEach, describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { authTokenStorageKey } from '../apollo.ts';
import { AuthRequiredPage } from './AuthRequiredPage.tsx';

const originalLocalStorage = Reflect.get(globalThis, 'localStorage') as
  | Storage
  | undefined;

afterEach(() => {
  if (originalLocalStorage) {
    Reflect.set(globalThis, 'localStorage', originalLocalStorage);
    return;
  }

  Reflect.deleteProperty(globalThis, 'localStorage');
});

describe(AuthRequiredPage.name, () => {
  test('renders a sign-in prompt when no access token is stored', () => {
    setStoredToken(null);

    const html = renderToStaticMarkup(
      <AuthRequiredPage
        title="Sign in to open your dashboard"
        description="Manage private workspace data."
        onRequestAuth={() => undefined}
      >
        <p>Private dashboard</p>
      </AuthRequiredPage>,
    );

    expect(html).toContain('Sign in to open your dashboard');
    expect(html).toContain('Manage private workspace data.');
    expect(html).toContain('Sign in');
    expect(html).not.toContain('Private dashboard');
  });

  test('renders protected content when an access token is stored', () => {
    setStoredToken('token-a');

    const html = renderToStaticMarkup(
      <AuthRequiredPage
        title="Sign in to open your dashboard"
        description="Manage private workspace data."
        onRequestAuth={() => undefined}
      >
        <p>Private dashboard</p>
      </AuthRequiredPage>,
    );

    expect(html).toContain('Private dashboard');
    expect(html).not.toContain('Sign in to open your dashboard');
  });
});

function setStoredToken(token: string | null) {
  const values = new Map<string, string>();
  if (token !== null) values.set(authTokenStorageKey, token);

  Reflect.set(globalThis, 'localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
  } as Storage);
}
