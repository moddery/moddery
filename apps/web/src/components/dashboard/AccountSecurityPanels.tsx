import { type DashboardData } from '../../lib/dashboard.ts';
import { ApiTokensPanel } from './account-security/ApiTokensPanel.tsx';
import { DeveloperApplicationsPanel } from './account-security/DeveloperApplicationsPanel.tsx';
import { LinkedAccountsPanel } from './account-security/LinkedAccountsPanel.tsx';
import { SessionsPanel } from './account-security/SessionsPanel.tsx';
import { TwoFactorPanel } from './account-security/TwoFactorPanel.tsx';

export function AccountSecurityPanels({
  dashboard,
  onUpdated,
}: {
  dashboard: Pick<DashboardData, 'authAccounts' | 'twoFactorEnabled'>;
  onUpdated: () => Promise<void>;
}) {
  return (
    <>
      <LinkedAccountsPanel accounts={dashboard.authAccounts} />
      <TwoFactorPanel
        enabled={dashboard.twoFactorEnabled}
        onUpdated={onUpdated}
      />
      <SessionsPanel />
      <ApiTokensPanel />
      <DeveloperApplicationsPanel />
    </>
  );
}
