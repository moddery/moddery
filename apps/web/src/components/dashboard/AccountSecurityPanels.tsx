import { ApiTokensPanel } from './account-security/ApiTokensPanel.tsx';
import { DeveloperApplicationsPanel } from './account-security/DeveloperApplicationsPanel.tsx';
import { SessionsPanel } from './account-security/SessionsPanel.tsx';

export function AccountSecurityPanels() {
  return (
    <>
      <SessionsPanel />
      <ApiTokensPanel />
      <DeveloperApplicationsPanel />
    </>
  );
}
