import { AppWindow } from 'lucide-react';

import { ClientSecretNotice } from './developer-applications/ClientSecretNotice.tsx';
import { DeveloperApplicationForm } from './developer-applications/DeveloperApplicationForm.tsx';
import { DeveloperApplicationList } from './developer-applications/DeveloperApplicationList.tsx';
import { useDeveloperApplicationsState } from './developer-applications/useDeveloperApplicationsState.ts';

export function DeveloperApplicationsPanel() {
  const state = useDeveloperApplicationsState();

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Developer applications
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Register applications that need user-authorized API access.
          </p>
        </div>
        <AppWindow className="size-5 text-accent-icon" />
      </div>

      <DeveloperApplicationForm state={state} />
      <ClientSecretNotice clientSecret={state.clientSecret} />
      <DeveloperApplicationList
        busy={state.busy}
        clients={state.clients}
        isLoading={state.isLoading}
        page={state.page}
        pageSize={state.pageSize}
        revoke={(clientId) => void state.revoke(clientId)}
        setPage={state.setPage}
        totalHits={state.totalHits}
      />
    </section>
  );
}
