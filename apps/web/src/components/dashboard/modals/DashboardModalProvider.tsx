import { createContext, useContext, useMemo, useState } from 'react';
import { type ReactNode } from 'react';

import { type DashboardData } from '../../../lib/dashboard.ts';
import { CreateCollectionModal } from './CreateCollectionModal.tsx';
import { CreateOrganizationModal } from './CreateOrganizationModal.tsx';
import { CreateProjectModal } from './CreateProjectModal.tsx';
import { UploadVersionModal } from './UploadVersionModal.tsx';

export type DashboardModalKind =
  | 'project'
  | 'version'
  | 'organization'
  | 'collection';

interface DashboardModalContextValue {
  openModal: (kind: DashboardModalKind) => void;
}

const DashboardModalContext = createContext<DashboardModalContextValue | null>(
  null,
);

export function useDashboardModal(): DashboardModalContextValue {
  const value = useContext(DashboardModalContext);
  if (value === null) {
    throw new Error(
      'useDashboardModal must be used within a DashboardModalProvider',
    );
  }
  return value;
}

export function DashboardModalProvider({
  children,
  dashboard,
  onUpdated,
}: {
  children: ReactNode;
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  const [active, setActive] = useState<DashboardModalKind | null>(null);

  const value = useMemo<DashboardModalContextValue>(
    () => ({ openModal: (kind) => setActive(kind) }),
    [],
  );

  function close() {
    setActive(null);
  }

  return (
    <DashboardModalContext.Provider value={value}>
      {children}

      <CreateProjectModal
        emailVerifiedAt={dashboard.emailVerifiedAt}
        open={dashboardModalForKind(active) === 'project'}
        onOpenChange={(open) => !open && close()}
        onCreated={onUpdated}
      />
      <UploadVersionModal
        emailVerifiedAt={dashboard.emailVerifiedAt}
        projects={dashboard.projects}
        open={dashboardModalForKind(active) === 'version'}
        onOpenChange={(open) => !open && close()}
        onCreated={onUpdated}
      />
      <CreateOrganizationModal
        open={dashboardModalForKind(active) === 'organization'}
        onOpenChange={(open) => !open && close()}
        onCreated={onUpdated}
      />
      <CreateCollectionModal
        open={dashboardModalForKind(active) === 'collection'}
        onOpenChange={(open) => !open && close()}
        onCreated={onUpdated}
      />
    </DashboardModalContext.Provider>
  );
}

export function dashboardModalForKind(
  active: DashboardModalKind | null,
): DashboardModalKind | null {
  return active;
}
