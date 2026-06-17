import { apolloClient } from '../../../apollo.js';
import {
  UPDATE_VIEWER_PROFILE_MUTATION,
  VIEWER_API_TOKENS_QUERY,
  VIEWER_SESSIONS_QUERY,
  CREATE_API_TOKEN_MUTATION,
  REVOKE_API_TOKEN_MUTATION,
  REVOKE_SESSION_MUTATION,
  NOTIFICATION_PREFERENCES_QUERY,
  UPDATE_NOTIFICATION_PREFERENCE_MUTATION,
  SEND_NOTIFICATION_MUTATION,
} from '../graphql.js';
import {
  type UpdateViewerProfileMutationData,
  type UpdateViewerProfileMutationVariables,
  type ViewerApiTokensQueryData,
  type ViewerSessionsQueryData,
  type CreateApiTokenMutationData,
  type CreateApiTokenMutationVariables,
  type RevokeApiTokenMutationData,
  type RevokeApiTokenMutationVariables,
  type RevokeSessionMutationData,
  type RevokeSessionMutationVariables,
  type NotificationPreferencesQueryData,
  type UpdateNotificationPreferenceMutationData,
  type SendNotificationMutationData,
  type SendNotificationMutationVariables,
  type UpdateNotificationPreferenceMutationVariables,
} from '../internal-types.js';
import {
  type ApiTokenSummary,
  type CreatedApiToken,
  type NotificationPreference,
  type SessionSummary,
  type UpdateViewerProfileInput,
  type ViewerProfileUpdate,
} from '../types.js';

export async function updateViewerProfile(
  input: UpdateViewerProfileInput,
): Promise<ViewerProfileUpdate> {
  const { data } = await apolloClient.mutate<
    UpdateViewerProfileMutationData,
    UpdateViewerProfileMutationVariables
  >({
    mutation: UPDATE_VIEWER_PROFILE_MUTATION,
    variables: { input },
  });

  if (
    data?.updateViewerProfile === null ||
    data?.updateViewerProfile === undefined
  ) {
    throw new Error('Profile update did not return a user');
  }

  return data.updateViewerProfile;
}

export async function fetchViewerApiTokens(
  signal?: AbortSignal,
): Promise<ApiTokenSummary[]> {
  const { data } = await apolloClient.query<ViewerApiTokensQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_API_TOKENS_QUERY,
  });

  return data.viewerApiTokens;
}

export async function fetchViewerSessions(
  signal?: AbortSignal,
): Promise<SessionSummary[]> {
  const { data } = await apolloClient.query<ViewerSessionsQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_SESSIONS_QUERY,
  });

  return data.viewerSessions;
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

export async function fetchNotificationPreferences(
  signal?: AbortSignal,
): Promise<NotificationPreference[]> {
  const { data } = await apolloClient.query<NotificationPreferencesQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: NOTIFICATION_PREFERENCES_QUERY,
  });

  return data.viewerNotificationPreferences;
}

export async function updateNotificationPreference(input: {
  channel: string;
  enabled: boolean;
  type: string;
}): Promise<NotificationPreference> {
  const { data } = await apolloClient.mutate<
    UpdateNotificationPreferenceMutationData,
    UpdateNotificationPreferenceMutationVariables
  >({
    mutation: UPDATE_NOTIFICATION_PREFERENCE_MUTATION,
    variables: { input },
  });

  if (!data?.updateNotificationPreference) {
    throw new Error('Notification preference did not return from the API');
  }

  return data.updateNotificationPreference;
}

export async function sendNotification(input: {
  actionUrl: string | null;
  body: string | null;
  title: string;
  type: string;
  username: string;
}): Promise<SendNotificationMutationData['sendNotification']> {
  const { data } = await apolloClient.mutate<
    SendNotificationMutationData,
    SendNotificationMutationVariables
  >({
    mutation: SEND_NOTIFICATION_MUTATION,
    variables: { input },
  });

  if (!data?.sendNotification) {
    throw new Error('Notification did not return from the API');
  }

  return data.sendNotification;
}
