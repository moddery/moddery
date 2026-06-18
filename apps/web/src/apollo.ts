import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export const graphqlUri =
  import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql';

export const authTokenStorageKey = 'moddery.accessToken';

const httpLink = createHttpLink({
  uri: graphqlUri,
});

const authLink = setContext(() => {
  const accessToken = localStorage.getItem(authTokenStorageKey);

  return {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
  };
});

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});
