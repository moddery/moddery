import { type Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { type SearchTag } from './ModCard.tsx';
import { AccountSecurityPanels } from './dashboard/AccountSecurityPanels.tsx';
import {
  AccountProfileForm,
  DirectMessagesPanel,
  FriendsPanel,
  NotificationPreferencesPanel,
  SendNotificationPanel,
  TeamInvitationsPanel,
} from './dashboard/AccountSettingsPanels.tsx';
import {
  AdminUsersPanel,
  FileScanForm,
  InfrastructureStatusPanel,
  ModerationQueue,
  ProjectModerationQueue,
  TaxonomyPanel,
} from './dashboard/AdminModerationPanels.tsx';
import {
  CollectionManagement,
  CreateOrganizationForm,
  OrganizationTeamManagementForm,
} from './dashboard/ContentManagementPanels.tsx';
import { DashboardHeader } from './dashboard/overview/DashboardHeader.tsx';
import {
  DashboardSectionNav,
  type DashboardSectionNavItem,
} from './dashboard/overview/DashboardSectionNav.tsx';
import { DashboardSkeleton } from './dashboard/overview/DashboardSkeleton.tsx';
import { DashboardSummarySections } from './dashboard/overview/DashboardSummarySections.tsx';
import { useDashboardPageState } from './dashboard/overview/useDashboardPageState.ts';
import { ProjectAnalyticsPanel } from './dashboard/ProjectInsightsPanels.tsx';
import { ProjectMetadataForm } from './dashboard/ProjectMetadataForm.tsx';
import {
  AddGalleryImageForm,
  EditVersionDependencyForm,
  EditVersionForm,
  ProjectTeamManagementForm,
  PublishProjectForm,
  PublishVersionForm,
} from './dashboard/ProjectWorkflowPanels.tsx';

export function DashboardPage({
  onOpenCollection,
  onOpenOrganization,
  onOpenProject,
  onTagSearch,
}: {
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenOrganization?: (slug: string) => void;
  onOpenProject: (mod: Mod) => void;
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
          onClear={() => window.location.assign('/')}
          itemLabel="dashboard"
        />
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState
          onClear={() => window.location.assign('/')}
          itemLabel="account"
        />
      </main>
    );
  }

  const sectionItems = dashboardSectionItems({
    canModerate,
    collectionCount: dashboard.collectionCount,
    organizationCount: dashboard.organizations.length,
    projectCount: dashboard.projectCount,
  });

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <DashboardHeader dashboard={dashboard} />

      <DashboardSectionNav items={sectionItems} />

      <section id="dashboard-account" className="scroll-mt-32">
        <AccountProfileForm
          dashboard={dashboard}
          onUpdated={refreshDashboard}
        />
        <NotificationPreferencesPanel />
        <FriendsPanel />
        <TeamInvitationsPanel />
        <DirectMessagesPanel />
        {canModerate && <SendNotificationPanel />}
      </section>

      <section id="dashboard-security" className="scroll-mt-32">
        <AccountSecurityPanels />
      </section>

      <section id="dashboard-content" className="scroll-mt-32">
        <CreateOrganizationForm
          organizations={dashboard.organizations}
          projects={dashboard.projects}
          onCreated={refreshDashboard}
        />

        {dashboard.organizations.length > 0 && (
          <OrganizationTeamManagementForm
            organizations={dashboard.organizations}
            onChanged={refreshDashboard}
          />
        )}
      </section>

      <section id="dashboard-projects" className="scroll-mt-32">
        <PublishProjectForm onCreated={refreshDashboard} />

        {dashboard.projects.length > 0 && (
          <>
            <ProjectMetadataForm
              projects={dashboard.projects}
              onUpdated={refreshDashboard}
            />
            <AddGalleryImageForm
              projects={dashboard.projects}
              onAdded={refreshDashboard}
            />
            <ProjectTeamManagementForm projects={dashboard.projects} />
            <ProjectAnalyticsPanel projects={dashboard.projects} />
            <EditVersionForm projects={dashboard.projects} />
            <EditVersionDependencyForm projects={dashboard.projects} />
            <PublishVersionForm projects={dashboard.projects} />
          </>
        )}
      </section>

      <section id="dashboard-collections" className="scroll-mt-32">
        <CollectionManagement
          collections={dashboard.collections}
          projects={dashboard.projects}
          onChanged={refreshDashboard}
        />
      </section>

      {canModerate && (
        <section id="dashboard-moderation" className="scroll-mt-32">
          {canAdmin && (
            <>
              <InfrastructureStatusPanel />
              <AdminUsersPanel viewerId={dashboard.id} />
              <TaxonomyPanel />
            </>
          )}
          <FileScanForm projects={dashboard.projects} />
          <ProjectModerationQueue onOpenProject={onOpenProject} />
          <ModerationQueue />
        </section>
      )}

      <section id="dashboard-overview" className="scroll-mt-32">
        <DashboardSummarySections
          dashboard={dashboard}
          onOpenCollection={onOpenCollection}
          onOpenOrganization={onOpenOrganization}
          onOpenProject={onOpenProject}
          onTagSearch={onTagSearch}
          onUpdated={refreshDashboard}
        />
      </section>
    </main>
  );
}

function dashboardSectionItems({
  canModerate,
  collectionCount,
  organizationCount,
  projectCount,
}: {
  canModerate: boolean;
  collectionCount: number;
  organizationCount: number;
  projectCount: number;
}): DashboardSectionNavItem[] {
  const items: DashboardSectionNavItem[] = [
    { id: 'dashboard-account', label: 'Account' },
    { id: 'dashboard-security', label: 'Security' },
    {
      count: organizationCount,
      id: 'dashboard-content',
      label: 'Organizations',
    },
    { count: projectCount, id: 'dashboard-projects', label: 'Projects' },
    {
      count: collectionCount,
      id: 'dashboard-collections',
      label: 'Collections',
    },
    { id: 'dashboard-overview', label: 'Overview' },
  ];

  if (canModerate) {
    items.splice(items.length - 1, 0, {
      id: 'dashboard-moderation',
      label: 'Moderation',
    });
  }

  return items;
}
