import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export const graphqlUri =
  import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql';

export const authTokenStorageKey = 'moddery.accessToken';
export const authTokenChangedEvent = 'moddery:auth-token-changed';

const httpLink = createHttpLink({
  uri: graphqlUri,
});

const authLink = setContext(() => {
  const accessToken = readStoredAuthToken();

  return {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
  };
});

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});

export function readStoredAuthToken(): string | null {
  return localStorage.getItem(authTokenStorageKey);
}

export function writeStoredAuthToken(accessToken: string): void {
  localStorage.setItem(authTokenStorageKey, accessToken);
  window.dispatchEvent(new Event(authTokenChangedEvent));
}

export function clearStoredAuthToken(): void {
  localStorage.removeItem(authTokenStorageKey);
  window.dispatchEvent(new Event(authTokenChangedEvent));
}
