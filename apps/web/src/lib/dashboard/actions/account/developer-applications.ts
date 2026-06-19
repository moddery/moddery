import { apolloClient } from '../../../../apollo.js';
import {
  CREATE_OAUTH_CLIENT_MUTATION,
  REVOKE_OAUTH_CLIENT_MUTATION,
  VIEWER_OAUTH_CLIENT_SEARCH_QUERY,
  VIEWER_OAUTH_CLIENTS_QUERY,
} from '../../graphql.js';
import {
  type CreateOAuthClientMutationData,
  type CreateOAuthClientMutationVariables,
  type RevokeOAuthClientMutationData,
  type RevokeOAuthClientMutationVariables,
  type ViewerOAuthClientSearchQueryData,
  type ViewerOAuthClientSearchQueryVariables,
  type ViewerOAuthClientsQueryData,
} from '../../internal-types.js';
import {
  type CreatedOAuthClient,
  type OAuthClientSearchResult,
  type OAuthClientSummary,
} from '../../types.js';

export async function fetchViewerOAuthClients(
  signal?: AbortSignal,
): Promise<OAuthClientSummary[]> {
  const { data } = await apolloClient.query<ViewerOAuthClientsQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_OAUTH_CLIENTS_QUERY,
  });

  return data.viewerOAuthClients;
}

export async function fetchViewerOAuthClientSearch(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<OAuthClientSearchResult> {
  const { data } = await apolloClient.query<
    ViewerOAuthClientSearchQueryData,
    ViewerOAuthClientSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_OAUTH_CLIENT_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  return data.viewerOAuthClientSearch;
}

export async function createOAuthClient(input: {
  description: string | null;
  homepageUrl: string | null;
  name: string;
  redirectUris: string[];
  scopes: string[] | null;
}): Promise<CreatedOAuthClient> {
  const { data } = await apolloClient.mutate<
    CreateOAuthClientMutationData,
    CreateOAuthClientMutationVariables
  >({
    mutation: CREATE_OAUTH_CLIENT_MUTATION,
    variables: { input },
  });

  if (!data?.createOAuthClient) {
    throw new Error('Application did not return from the API');
  }

  return data.createOAuthClient;
}

export async function revokeOAuthClient(
  clientId: string,
): Promise<OAuthClientSummary> {
  const { data } = await apolloClient.mutate<
    RevokeOAuthClientMutationData,
    RevokeOAuthClientMutationVariables
  >({
    mutation: REVOKE_OAUTH_CLIENT_MUTATION,
    variables: { clientId },
  });

  if (!data?.revokeOAuthClient) {
    throw new Error('Application revocation did not return from the API');
  }

  return data.revokeOAuthClient;
}
