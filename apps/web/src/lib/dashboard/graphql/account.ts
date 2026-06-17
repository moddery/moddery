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
