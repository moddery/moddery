import { type Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
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
  onOpenProject,
}: {
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenProject: (mod: Mod) => void;
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

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <DashboardHeader dashboard={dashboard} />

      <AccountProfileForm dashboard={dashboard} onUpdated={refreshDashboard} />

      <NotificationPreferencesPanel />

      <FriendsPanel />

      <TeamInvitationsPanel />

      <DirectMessagesPanel />

      {canModerate && <SendNotificationPanel />}

      <AccountSecurityPanels />

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

      <CollectionManagement
        collections={dashboard.collections}
        projects={dashboard.projects}
        onChanged={refreshDashboard}
      />

      {canModerate && (
        <>
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
        </>
      )}

      <DashboardSummarySections
        dashboard={dashboard}
        onOpenCollection={onOpenCollection}
        onOpenProject={onOpenProject}
      />
    </main>
  );
}
