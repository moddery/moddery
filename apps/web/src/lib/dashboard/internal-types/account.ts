import {
  type ApiTokenSearchResult,
  type ApiTokenSummary,
  type CreatedApiToken,
  type CreatedOAuthClient,
  type DirectThread,
  type DirectThreadSearchResult,
  type NotificationPreference,
  type OAuthClientSearchResult,
  type OAuthClientSummary,
  type SessionSearchResult,
  type SessionSummary,
  type TeamInvitationSearchResult,
  type TeamInvitationSummary,
  type TwoFactorSetup,
} from '../types.js';

export interface ViewerDirectThreadsQueryData {
  viewerDirectThreadSearch: DirectThreadSearchResult;
}

export interface ViewerDirectThreadsQueryVariables {
  limit: number;
  offset: number;
}

export interface CreateDirectThreadMutationData {
  createDirectThread: DirectThread;
}

export interface CreateDirectThreadMutationVariables {
  input: {
    body: string;
    username: string;
  };
}

export interface CreateDirectThreadMessageMutationData {
  createDirectThreadMessage: DirectThread;
}

export interface CreateDirectThreadMessageMutationVariables {
  input: {
    body: string;
    threadId: string;
  };
}

export interface MarkDirectThreadReadMutationData {
  markDirectThreadRead: DirectThread;
}

export interface MarkDirectThreadReadMutationVariables {
  threadId: string;
}

export interface ViewerApiTokensQueryData {
  viewerApiTokens: ApiTokenSummary[];
}

export interface ViewerApiTokenSearchQueryData {
  viewerApiTokenSearch: ApiTokenSearchResult;
}

export interface ViewerApiTokenSearchQueryVariables {
  includeRevoked?: boolean | null;
  limit: number;
  offset: number;
}

export interface ViewerSecurityQueryVariables {
  includeRevoked?: boolean | null;
}

export interface ViewerSessionsQueryData {
  viewerSessions: SessionSummary[];
}

export interface ViewerSessionSearchQueryData {
  viewerSessionSearch: SessionSearchResult;
}

export interface ViewerSessionSearchQueryVariables {
  includeRevoked?: boolean | null;
  limit: number;
  offset: number;
}

export interface CreateApiTokenMutationData {
  createApiToken: CreatedApiToken;
}

export interface CreateApiTokenMutationVariables {
  input: {
    expiresInDays: number | null;
    name: string;
    scopes: string[];
  };
}

export interface RevokeApiTokenMutationData {
  revokeApiToken: ApiTokenSummary;
}

export interface RevokeApiTokenMutationVariables {
  tokenId: string;
}

export interface RevokeSessionMutationData {
  revokeSession: SessionSummary;
}

export interface RevokeSessionMutationVariables {
  sessionId: string;
}

export interface SetupTwoFactorMutationData {
  setupTwoFactor: TwoFactorSetup;
}

export interface TwoFactorMutationData {
  disableTwoFactor?: boolean;
  enableTwoFactor?: boolean;
}

export interface TwoFactorMutationVariables {
  input: {
    code: string;
  };
}

export interface ViewerOAuthClientsQueryData {
  viewerOAuthClients: OAuthClientSummary[];
}

export interface ViewerOAuthClientSearchQueryData {
  viewerOAuthClientSearch: OAuthClientSearchResult;
}

export interface ViewerOAuthClientSearchQueryVariables {
  limit: number;
  offset: number;
}

export interface CreateOAuthClientMutationData {
  createOAuthClient: CreatedOAuthClient;
}

export interface CreateOAuthClientMutationVariables {
  input: {
    description: string | null;
    homepageUrl: string | null;
    name: string;
    redirectUris: string[];
    scopes: string[] | null;
  };
}

export interface RevokeOAuthClientMutationData {
  revokeOAuthClient: OAuthClientSummary;
}

export interface RevokeOAuthClientMutationVariables {
  clientId: string;
}

export interface ViewerTeamInvitationsQueryData {
  viewerTeamInvitations: TeamInvitationSummary[];
}

export interface ViewerTeamInvitationSearchQueryData {
  viewerTeamInvitationSearch: TeamInvitationSearchResult;
}

export interface ViewerTeamInvitationSearchQueryVariables {
  limit: number;
  offset: number;
}

export interface AcceptTeamInvitationMutationData {
  acceptTeamInvitation: TeamInvitationSummary;
}

export interface DeclineTeamInvitationMutationData {
  declineTeamInvitation: TeamInvitationSummary;
}

export interface TeamInvitationMutationVariables {
  invitationId: string;
}

export interface NotificationPreferencesQueryData {
  viewerNotificationPreferences: NotificationPreference[];
}

export interface UpdateNotificationPreferenceMutationData {
  updateNotificationPreference: NotificationPreference;
}

export interface SendNotificationMutationData {
  sendNotification: {
    actionUrl: string | null;
    body: string | null;
    createdAt: string;
    id: string;
    readAt: string | null;
    state: string;
    title: string;
    type: string;
  };
}

export interface SendNotificationMutationVariables {
  input: {
    actionUrl: string | null;
    body: string | null;
    title: string;
    type: string;
    username: string;
  };
}

export interface UpdateNotificationPreferenceMutationVariables {
  input: {
    channel: string;
    enabled: boolean;
    type: string;
  };
}
