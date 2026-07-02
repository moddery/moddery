import { AppWindow } from 'lucide-react';

import { ClientSecretNotice } from './developer-applications/ClientSecretNotice.tsx';
import { DeveloperApplicationForm } from './developer-applications/DeveloperApplicationForm.tsx';
import { DeveloperApplicationList } from './developer-applications/DeveloperApplicationList.tsx';
import { useDeveloperApplicationsState } from './developer-applications/useDeveloperApplicationsState.ts';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';

export function DeveloperApplicationsPanel() {
  const state = useDeveloperApplicationsState();

  return (
    <CollapsiblePanel
      title="Developer applications"
      description="Register applications that need user-authorized API access."
      action={<AppWindow className="size-5 text-accent-icon" />}
    >
      <DeveloperApplicationForm state={state} />
      <ClientSecretNotice clientSecret={state.clientSecret} />
      <DeveloperApplicationList
        clients={state.clients}
        isLoading={state.isLoading}
        page={state.page}
        pageSize={state.pageSize}
        revokingClientId={state.revokingClientId}
        revoke={(clientId) => void state.revoke(clientId)}
        setPage={state.setPage}
        totalHits={state.totalHits}
      />
    </CollapsiblePanel>
  );
}
