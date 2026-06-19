import { apolloClient } from '../../../../apollo.js';
import {
  CREATE_API_TOKEN_MUTATION,
  REVOKE_API_TOKEN_MUTATION,
  REVOKE_SESSION_MUTATION,
  VIEWER_API_TOKEN_SEARCH_QUERY,
  VIEWER_API_TOKENS_QUERY,
  VIEWER_SESSION_SEARCH_QUERY,
  VIEWER_SESSIONS_QUERY,
} from '../../graphql.js';
import {
  type CreateApiTokenMutationData,
  type CreateApiTokenMutationVariables,
  type RevokeApiTokenMutationData,
  type RevokeApiTokenMutationVariables,
  type RevokeSessionMutationData,
  type RevokeSessionMutationVariables,
  type ViewerApiTokenSearchQueryData,
  type ViewerApiTokenSearchQueryVariables,
  type ViewerApiTokensQueryData,
  type ViewerSecurityQueryVariables,
  type ViewerSessionSearchQueryData,
  type ViewerSessionSearchQueryVariables,
  type ViewerSessionsQueryData,
} from '../../internal-types.js';
import {
  type ApiTokenSearchResult,
  type ApiTokenSummary,
  type CreatedApiToken,
  type SessionSearchResult,
  type SessionSummary,
} from '../../types.js';

export async function fetchViewerApiTokens(
  includeRevoked = false,
  signal?: AbortSignal,
): Promise<ApiTokenSummary[]> {
  const { data } = await apolloClient.query<
    ViewerApiTokensQueryData,
    ViewerSecurityQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_API_TOKENS_QUERY,
    variables: { includeRevoked },
  });

  return data.viewerApiTokens;
}

export async function fetchViewerApiTokenSearch(
  includeRevoked = false,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<ApiTokenSearchResult> {
  const { data } = await apolloClient.query<
    ViewerApiTokenSearchQueryData,
    ViewerApiTokenSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_API_TOKEN_SEARCH_QUERY,
    variables: {
      includeRevoked,
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  return data.viewerApiTokenSearch;
}

export async function fetchViewerSessions(
  includeRevoked = false,
  signal?: AbortSignal,
): Promise<SessionSummary[]> {
  const { data } = await apolloClient.query<
    ViewerSessionsQueryData,
    ViewerSecurityQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_SESSIONS_QUERY,
    variables: { includeRevoked },
  });

  return data.viewerSessions;
}

export async function fetchViewerSessionSearch(
  includeRevoked = false,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<SessionSearchResult> {
  const { data } = await apolloClient.query<
    ViewerSessionSearchQueryData,
    ViewerSessionSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_SESSION_SEARCH_QUERY,
    variables: {
      includeRevoked,
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  return data.viewerSessionSearch;
}

export async function createApiToken(input: {
  expiresInDays: number | null;
  name: string;
  scopes: string[];
}): Promise<CreatedApiToken> {
  const { data } = await apolloClient.mutate<
    CreateApiTokenMutationData,
    CreateApiTokenMutationVariables
  >({
    mutation: CREATE_API_TOKEN_MUTATION,
    variables: { input },
  });

  if (!data?.createApiToken) {
    throw new Error('API token did not return from the API');
  }

  return data.createApiToken;
}

export async function revokeSession(
  sessionId: string,
): Promise<SessionSummary> {
  const { data } = await apolloClient.mutate<
    RevokeSessionMutationData,
    RevokeSessionMutationVariables
  >({
    mutation: REVOKE_SESSION_MUTATION,
    variables: { sessionId },
  });

  if (!data?.revokeSession) {
    throw new Error('Session revocation did not return from the API');
  }

  return data.revokeSession;
}

export async function revokeApiToken(
  tokenId: string,
): Promise<ApiTokenSummary> {
  const { data } = await apolloClient.mutate<
    RevokeApiTokenMutationData,
    RevokeApiTokenMutationVariables
  >({
    mutation: REVOKE_API_TOKEN_MUTATION,
    variables: { tokenId },
  });

  if (!data?.revokeApiToken) {
    throw new Error('API token revocation did not return from the API');
  }

  return data.revokeApiToken;
}
