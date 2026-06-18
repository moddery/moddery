import { type ProjectKind } from '@moddery/shared';

export interface ApiTokenSummary {
  createdAt: string;
  expiresAt: string | null;
  id: string;
  lastUsedAt: string | null;
  name: string;
  revokedAt: string | null;
  scopes: string[];
}

export interface ApiTokenSearchResult {
  tokens: ApiTokenSummary[];
  totalHits: number;
}

export interface SessionSummary {
  createdAt: string;
  expiresAt: string;
  id: string;
  lastUsedAt: string;
  revokedAt: string | null;
  userAgent: string | null;
}

export interface SessionSearchResult {
  sessions: SessionSummary[];
  totalHits: number;
}

export interface CreatedApiToken {
  token: string;
  tokenSummary: ApiTokenSummary;
}

export interface OAuthClientRedirectUri {
  createdAt: string;
  id: string;
  uri: string;
}

export interface OAuthClientSummary {
  clientId: string | null;
  createdAt: string;
  description: string | null;
  homepageUrl: string | null;
  id: string;
  name: string;
  redirectUris: OAuthClientRedirectUri[];
  revokedAt: string | null;
  scopes: string[];
  status: string;
  updatedAt: string;
}

export interface OAuthClientSearchResult {
  clients: OAuthClientSummary[];
  totalHits: number;
}

export interface CreatedOAuthClient {
  client: OAuthClientSummary;
  clientSecret: string;
}

export interface TeamInvitationTarget {
  id: string;
  name: string;
  projectKind: ProjectKind | null;
  slug: string;
  type: 'ORGANIZATION' | 'PROJECT';
}

export interface TeamInvitationSummary {
  createdAt: string;
  id: string;
  permissions: string[];
  role: string;
  target: TeamInvitationTarget;
}

export interface TeamInvitationSearchResult {
  invitations: TeamInvitationSummary[];
  totalHits: number;
}

export interface NotificationPreference {
  channel: 'EMAIL' | 'IN_APP';
  enabled: boolean;
  type: string;
  updatedAt: string;
}
