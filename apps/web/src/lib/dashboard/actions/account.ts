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
  VIEWER_DIRECT_THREADS_QUERY,
  CREATE_DIRECT_THREAD_MUTATION,
  CREATE_DIRECT_THREAD_MESSAGE_MUTATION,
  VIEWER_OAUTH_CLIENTS_QUERY,
  CREATE_OAUTH_CLIENT_MUTATION,
  REVOKE_OAUTH_CLIENT_MUTATION,
  VIEWER_TEAM_INVITATIONS_QUERY,
  ACCEPT_TEAM_INVITATION_MUTATION,
  DECLINE_TEAM_INVITATION_MUTATION,
} from '../graphql.js';
import {
  type UpdateViewerProfileMutationData,
  type UpdateViewerProfileMutationVariables,
  type ViewerApiTokensQueryData,
  type ViewerSessionsQueryData,
  type ViewerSecurityQueryVariables,
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
  type ViewerDirectThreadsQueryData,
  type CreateDirectThreadMutationData,
  type CreateDirectThreadMutationVariables,
  type CreateDirectThreadMessageMutationData,
  type CreateDirectThreadMessageMutationVariables,
  type ViewerOAuthClientsQueryData,
  type CreateOAuthClientMutationData,
  type CreateOAuthClientMutationVariables,
  type RevokeOAuthClientMutationData,
  type RevokeOAuthClientMutationVariables,
  type ViewerTeamInvitationsQueryData,
  type AcceptTeamInvitationMutationData,
  type DeclineTeamInvitationMutationData,
  type TeamInvitationMutationVariables,
} from '../internal-types.js';
import {
  type ApiTokenSummary,
  type CreatedApiToken,
  type DirectThread,
  type NotificationPreference,
  type OAuthClientSummary,
  type CreatedOAuthClient,
  type TeamInvitationSummary,
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

export async function fetchViewerTeamInvitations(
  signal?: AbortSignal,
): Promise<TeamInvitationSummary[]> {
  const { data } = await apolloClient.query<ViewerTeamInvitationsQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_TEAM_INVITATIONS_QUERY,
  });

  return data.viewerTeamInvitations;
}

export async function acceptTeamInvitation(
  invitationId: string,
): Promise<TeamInvitationSummary> {
  const { data } = await apolloClient.mutate<
    AcceptTeamInvitationMutationData,
    TeamInvitationMutationVariables
  >({
    mutation: ACCEPT_TEAM_INVITATION_MUTATION,
    variables: { invitationId },
  });

  if (!data?.acceptTeamInvitation) {
    throw new Error('Team invitation accept did not return from the API');
  }

  return data.acceptTeamInvitation;
}

export async function declineTeamInvitation(
  invitationId: string,
): Promise<TeamInvitationSummary> {
  const { data } = await apolloClient.mutate<
    DeclineTeamInvitationMutationData,
    TeamInvitationMutationVariables
  >({
    mutation: DECLINE_TEAM_INVITATION_MUTATION,
    variables: { invitationId },
  });

  if (!data?.declineTeamInvitation) {
    throw new Error('Team invitation decline did not return from the API');
  }

  return data.declineTeamInvitation;
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

export async function fetchViewerDirectThreads(
  signal?: AbortSignal,
): Promise<DirectThread[]> {
  const { data } = await apolloClient.query<ViewerDirectThreadsQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_DIRECT_THREADS_QUERY,
  });

  return data.viewerDirectThreads;
}

export async function createDirectThread(input: {
  body: string;
  username: string;
}): Promise<DirectThread> {
  const { data } = await apolloClient.mutate<
    CreateDirectThreadMutationData,
    CreateDirectThreadMutationVariables
  >({
    mutation: CREATE_DIRECT_THREAD_MUTATION,
    variables: { input },
  });

  if (!data?.createDirectThread) {
    throw new Error('Direct thread did not return from the API');
  }

  return data.createDirectThread;
}

export async function createDirectThreadMessage(input: {
  body: string;
  threadId: string;
}): Promise<DirectThread> {
  const { data } = await apolloClient.mutate<
    CreateDirectThreadMessageMutationData,
    CreateDirectThreadMessageMutationVariables
  >({
    mutation: CREATE_DIRECT_THREAD_MESSAGE_MUTATION,
    variables: { input },
  });

  if (!data?.createDirectThreadMessage) {
    throw new Error('Direct thread message did not return from the API');
  }

  return data.createDirectThreadMessage;
}
