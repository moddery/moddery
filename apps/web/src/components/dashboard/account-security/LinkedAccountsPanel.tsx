import { KeyRound } from 'lucide-react';

import { type DashboardAuthAccount } from '../../../lib/dashboard.ts';
import {
  linkedAccountAddedLabel,
  linkedAccountProviderLabel,
} from './linked-accounts/linked-account-labels.ts';
import { CollapsiblePanel, PanelEmptyState } from '../../ui/dashboard/index.ts';

export function LinkedAccountsPanel({
  accounts,
}: {
  accounts: DashboardAuthAccount[];
}) {
  return (
    <CollapsiblePanel
      title="Linked accounts"
      description="External sign-in providers connected to this account."
      action={<KeyRound className="size-5 text-accent-icon" />}
    >
      {accounts.length === 0 ? (
        <PanelEmptyState title="No linked providers." />
      ) : (
        <div className="mt-4 grid gap-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface p-3"
            >
              <span className="text-sm font-extrabold text-ink">
                {linkedAccountProviderLabel(account)}
              </span>
              <span className="text-xs font-semibold uppercase text-muted">
                {linkedAccountAddedLabel(account)}
              </span>
            </div>
          ))}
        </div>
      )}
    </CollapsiblePanel>
  );
}
