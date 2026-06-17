import { gql } from '@apollo/client';

export const UPDATE_VIEWER_PROFILE_MUTATION = gql`
  mutation UpdateViewerProfile($input: UpdateViewerProfileInput!) {
    updateViewerProfile(input: $input) {
      avatarUrl
      bio
      displayName
      email
      emailVerifiedAt
      id
      newsletterOptIn
      twoFactorEnabled
      username
    }
  }
`;

export const VIEWER_API_TOKENS_QUERY = gql`
  query ViewerApiTokens {
    viewerApiTokens {
      createdAt
      expiresAt
      id
      lastUsedAt
      name
      revokedAt
      scopes
    }
  }
`;

export const VIEWER_SESSIONS_QUERY = gql`
  query ViewerSessions {
    viewerSessions {
      createdAt
      expiresAt
      id
      lastUsedAt
      revokedAt
      userAgent
    }
  }
`;

export const CREATE_API_TOKEN_MUTATION = gql`
  mutation CreateApiToken($input: CreateApiTokenInput!) {
    createApiToken(input: $input) {
      token
      tokenSummary {
        createdAt
        expiresAt
        id
        lastUsedAt
        name
        revokedAt
        scopes
      }
    }
  }
`;

export const REVOKE_API_TOKEN_MUTATION = gql`
  mutation RevokeApiToken($tokenId: String!) {
    revokeApiToken(tokenId: $tokenId) {
      createdAt
      expiresAt
      id
      lastUsedAt
      name
      revokedAt
      scopes
    }
  }
`;

export const REVOKE_SESSION_MUTATION = gql`
  mutation RevokeSession($sessionId: String!) {
    revokeSession(sessionId: $sessionId) {
      createdAt
      expiresAt
      id
      lastUsedAt
      revokedAt
      userAgent
    }
  }
`;

const OAUTH_CLIENT_FIELDS = gql`
  fragment OAuthClientFields on OAuthClientSummary {
    clientId
    createdAt
    description
    homepageUrl
    id
    name
    redirectUris {
      createdAt
      id
      uri
    }
    revokedAt
    scopes
    status
    updatedAt
  }
`;

export const VIEWER_OAUTH_CLIENTS_QUERY = gql`
  ${OAUTH_CLIENT_FIELDS}
  query ViewerOAuthClients {
    viewerOAuthClients {
      ...OAuthClientFields
    }
  }
`;

export const CREATE_OAUTH_CLIENT_MUTATION = gql`
  ${OAUTH_CLIENT_FIELDS}
  mutation CreateOAuthClient($input: CreateOAuthClientInput!) {
    createOAuthClient(input: $input) {
      clientSecret
      client {
        ...OAuthClientFields
      }
    }
  }
`;

export const REVOKE_OAUTH_CLIENT_MUTATION = gql`
  ${OAUTH_CLIENT_FIELDS}
  mutation RevokeOAuthClient($clientId: String!) {
    revokeOAuthClient(clientId: $clientId) {
      ...OAuthClientFields
    }
  }
`;

const TEAM_INVITATION_FIELDS = gql`
  fragment TeamInvitationFields on TeamInvitationSummary {
    createdAt
    id
    permissions
    role
    target {
      id
      name
      slug
      type
    }
  }
`;

export const VIEWER_TEAM_INVITATIONS_QUERY = gql`
  ${TEAM_INVITATION_FIELDS}
  query ViewerTeamInvitations {
    viewerTeamInvitations {
      ...TeamInvitationFields
    }
  }
`;

export const ACCEPT_TEAM_INVITATION_MUTATION = gql`
  ${TEAM_INVITATION_FIELDS}
  mutation AcceptTeamInvitation($invitationId: String!) {
    acceptTeamInvitation(invitationId: $invitationId) {
      ...TeamInvitationFields
    }
  }
`;

export const DECLINE_TEAM_INVITATION_MUTATION = gql`
  ${TEAM_INVITATION_FIELDS}
  mutation DeclineTeamInvitation($invitationId: String!) {
    declineTeamInvitation(invitationId: $invitationId) {
      ...TeamInvitationFields
    }
  }
`;

export const NOTIFICATION_PREFERENCES_QUERY = gql`
  query NotificationPreferences {
    viewerNotificationPreferences {
      channel
      enabled
      type
      updatedAt
    }
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCE_MUTATION = gql`
  mutation UpdateNotificationPreference(
    $input: UpdateNotificationPreferenceInput!
  ) {
    updateNotificationPreference(input: $input) {
      channel
      enabled
      type
      updatedAt
    }
  }
`;

export const SEND_NOTIFICATION_MUTATION = gql`
  mutation SendNotification($input: SendNotificationInput!) {
    sendNotification(input: $input) {
      actionUrl
      body
      createdAt
      id
      readAt
      state
      title
      type
    }
  }
`;

const DIRECT_THREAD_FIELDS = gql`
  fragment DirectThreadFields on ThreadSummary {
    createdAt
    id
    members {
      createdAt
      lastReadAt
      user {
        displayName
        id
        username
      }
    }
    messages {
      author {
        displayName
        id
        username
      }
      body
      createdAt
      id
    }
    reportId
    subject
    updatedAt
  }
`;

export const VIEWER_DIRECT_THREADS_QUERY = gql`
  ${DIRECT_THREAD_FIELDS}
  query ViewerDirectThreads {
    viewerDirectThreads {
      ...DirectThreadFields
    }
  }
`;

export const CREATE_DIRECT_THREAD_MUTATION = gql`
  ${DIRECT_THREAD_FIELDS}
  mutation CreateDirectThread($input: CreateDirectThreadInput!) {
    createDirectThread(input: $input) {
      ...DirectThreadFields
    }
  }
`;

export const CREATE_DIRECT_THREAD_MESSAGE_MUTATION = gql`
  ${DIRECT_THREAD_FIELDS}
  mutation CreateDirectThreadMessage($input: CreateDirectThreadMessageInput!) {
    createDirectThreadMessage(input: $input) {
      ...DirectThreadFields
    }
  }
`;
