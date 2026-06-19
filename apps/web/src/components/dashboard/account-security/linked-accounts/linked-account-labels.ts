import { type DashboardAuthAccount } from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';

export function linkedAccountProviderLabel(
  account: Pick<DashboardAuthAccount, 'provider'>,
) {
  return providerLabels[account.provider] ?? account.provider;
}

export function linkedAccountAddedLabel(
  account: Pick<DashboardAuthAccount, 'createdAt'>,
  now = new Date(),
) {
  return `Linked ${timeAgo(account.createdAt, now)}`;
}

const providerLabels: Record<string, string> = {
  DISCORD: 'Discord',
  GITHUB: 'GitHub',
  GOOGLE: 'Google',
};
