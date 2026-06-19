import { type Mod } from '../types.ts';
import { type SelectedProject } from '../app/routing.ts';
import { EmptyState } from './EmptyState.tsx';
import { type SearchTag } from './ModCard.tsx';
import { DashboardHeader } from './dashboard/overview/DashboardHeader.tsx';
import { DashboardSectionNav } from './dashboard/overview/DashboardSectionNav.tsx';
import { dashboardSectionItems } from './dashboard/overview/dashboardSectionItems.ts';
import { DashboardSections } from './dashboard/overview/DashboardSections.tsx';
import { DashboardSkeleton } from './dashboard/overview/DashboardSkeleton.tsx';
import { useDashboardPageState } from './dashboard/overview/useDashboardPageState.ts';

export function DashboardPage({
  onHome,
  onOpenCollection,
  onOpenOrganization,
  onOpenProject,
  onOpenProjectReference,
  onTagSearch,
}: {
  onHome: () => void;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
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
          onClear={onHome}
          itemLabel="dashboard"
        />
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState
          actionLabel="Go home"
          onClear={onHome}
          itemLabel="account"
        />
      </main>
    );
  }

  const sectionItems = dashboardSectionItems({
    canModerate,
    collectionCount: dashboard.collectionCount,
    organizationCount: dashboard.organizationCount,
    projectCount: dashboard.projectCount,
  });

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <DashboardHeader dashboard={dashboard} />

      <DashboardSectionNav items={sectionItems} />

      <DashboardSections
        canAdmin={canAdmin}
        canModerate={canModerate}
        dashboard={dashboard}
        onOpenCollection={onOpenCollection}
        onOpenOrganization={onOpenOrganization}
        onOpenProject={onOpenProject}
        onOpenProjectReference={onOpenProjectReference}
        onTagSearch={onTagSearch}
        onUpdated={refreshDashboard}
      />
    </main>
  );
}
