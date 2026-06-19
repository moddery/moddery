import { type DashboardData } from '../../lib/dashboard.ts';
import { ApiTokensPanel } from './account-security/ApiTokensPanel.tsx';
import { DeveloperApplicationsPanel } from './account-security/DeveloperApplicationsPanel.tsx';
import { LinkedAccountsPanel } from './account-security/LinkedAccountsPanel.tsx';
import { SessionsPanel } from './account-security/SessionsPanel.tsx';

export function AccountSecurityPanels({
  dashboard,
}: {
  dashboard: Pick<DashboardData, 'authAccounts'>;
}) {
  return (
    <>
      <LinkedAccountsPanel accounts={dashboard.authAccounts} />
      <SessionsPanel />
      <ApiTokensPanel />
      <DeveloperApplicationsPanel />
    </>
  );
}
