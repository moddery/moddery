import { type OAuthClientSummary } from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';

export function redirectUriLabel({
  createdAt,
}: Pick<OAuthClientSummary['redirectUris'][number], 'createdAt'>) {
  return `Added ${timeAgo(createdAt)}`;
}

export function oauthClientIdLabel(clientId: string | null) {
  return clientId ?? 'Client ID pending';
}

export function oauthClientRevoked(
  client: Pick<OAuthClientSummary, 'revokedAt' | 'status'>,
) {
  return client.status === 'REVOKED' || client.revokedAt !== null;
}
