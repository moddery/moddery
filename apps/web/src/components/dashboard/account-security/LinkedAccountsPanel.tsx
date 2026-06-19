import { KeyRound } from 'lucide-react';

import { type DashboardAuthAccount } from '../../../lib/dashboard.ts';
import {
  linkedAccountAddedLabel,
  linkedAccountProviderLabel,
} from './linked-accounts/linked-account-labels.ts';

export function LinkedAccountsPanel({
  accounts,
}: {
  accounts: DashboardAuthAccount[];
}) {
  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Linked accounts
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            External sign-in providers connected to this account.
          </p>
        </div>
        <KeyRound className="size-5 text-accent-icon" />
      </div>

      {accounts.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No linked providers.</p>
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
    </section>
  );
}
