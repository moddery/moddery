import { type Mod } from '../types.ts';
import {
  type DashboardEditTarget,
  type SelectedProject,
} from '../app/routing.ts';
import { type DashboardData } from '../lib/dashboard.ts';
import { EmptyState } from './EmptyState.tsx';
import { type SearchTag } from './ModCard.tsx';
import { DashboardHeader } from './dashboard/overview/DashboardHeader.tsx';
import { DashboardSectionNav } from './dashboard/overview/DashboardSectionNav.tsx';
import { dashboardSectionItems } from './dashboard/overview/dashboardSectionItems.ts';
import { DashboardSections } from './dashboard/overview/DashboardSections.tsx';
import { DashboardEditPage } from './dashboard/edit/DashboardEditPage.tsx';
import { DashboardSkeleton } from './dashboard/overview/DashboardSkeleton.tsx';
import { useDashboardPageState } from './dashboard/overview/useDashboardPageState.ts';
import { useDashboardSection } from './dashboard/overview/useDashboardSection.ts';
import { DashboardModalProvider } from './dashboard/modals/DashboardModalProvider.tsx';

export function DashboardPage({
  editTarget,
  onCloseEdit,
  onHome,
  onOpenCollection,
  onOpenEdit,
  onOpenOrganization,
  onOpenProject,
  onOpenProjectReference,
  onTagSearch,
}: {
  editTarget?: DashboardEditTarget | null;
  onCloseEdit?: () => void;
  onHome: () => void;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenEdit?: (target: DashboardEditTarget) => void;
  onOpenOrganization?: (slug: string) => void;
  onOpenProject: (mod: Mod) => void;
  onOpenProjectReference?: (project: SelectedProject) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  const { canAdmin, canModerate, dashboard, dashboardQuery, refreshDashboard } =
    useDashboardPageState();

  if (dashboardQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (dashboardQuery.error) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState
          actionLabel="Go home"
          body={
            dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : 'The dashboard request failed.'
          }
          onClear={onHome}
          title="Dashboard failed to load"
        />
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState
          actionLabel="Go home"
          body="Sign in again to open your dashboard."
          onClear={onHome}
          title="No dashboard session"
        />
      </main>
    );
  }

  if (editTarget) {
    return (
      <DashboardEditPage
        dashboard={dashboard}
        target={editTarget}
        onClose={onCloseEdit ?? onHome}
        onUpdated={refreshDashboard}
      />
    );
  }

  return (
    <DashboardWorkspace
      canAdmin={canAdmin}
      canModerate={canModerate}
      dashboard={dashboard}
      onOpenCollection={onOpenCollection}
      onOpenEdit={onOpenEdit}
      onOpenOrganization={onOpenOrganization}
      onOpenProject={onOpenProject}
      onOpenProjectReference={onOpenProjectReference}
      onTagSearch={onTagSearch}
      onUpdated={refreshDashboard}
    />
  );
}

function DashboardWorkspace({
  canAdmin,
  canModerate,
  dashboard,
  onOpenCollection,
  onOpenEdit,
  onOpenOrganization,
  onOpenProject,
  onOpenProjectReference,
  onTagSearch,
  onUpdated,
}: {
  canAdmin: boolean;
  canModerate: boolean;
  dashboard: DashboardData;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenEdit?: (target: DashboardEditTarget) => void;
  onOpenOrganization?: (slug: string) => void;
  onOpenProject: (mod: Mod) => void;
  onOpenProjectReference?: (project: SelectedProject) => void;
  onTagSearch?: (tag: SearchTag) => void;
  onUpdated: () => Promise<void>;
}) {
  const sectionItems = dashboardSectionItems({
    canModerate,
    collectionCount: dashboard.collectionCount,
    organizationCount: dashboard.organizationCount,
    projectCount: dashboard.projectCount,
  });
  const { activeId, selectSection } = useDashboardSection(
    sectionItems.map((item) => item.id),
  );

  return (
    <DashboardModalProvider dashboard={dashboard} onUpdated={onUpdated}>
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <DashboardHeader dashboard={dashboard} />

        <div className="mt-6 lg:flex lg:items-start lg:gap-8">
          <DashboardSectionNav
            activeId={activeId}
            items={sectionItems}
            onSelect={selectSection}
          />

          <div className="min-w-0 flex-1">
            <DashboardSections
              activeId={activeId}
              canAdmin={canAdmin}
              canModerate={canModerate}
              dashboard={dashboard}
              onOpenCollection={onOpenCollection}
              onOpenEdit={onOpenEdit}
              onOpenOrganization={onOpenOrganization}
              onOpenProject={onOpenProject}
              onOpenProjectReference={onOpenProjectReference}
              onTagSearch={onTagSearch}
              onUpdated={onUpdated}
            />
          </div>
        </div>
      </main>
    </DashboardModalProvider>
  );
}
