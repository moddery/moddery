import { type SelectedProject } from '../../../app/routing.ts';
import { type DashboardData } from '../../../lib/dashboard.ts';
import { type Mod } from '../../../types.ts';
import { type SearchTag } from '../../ModCard.tsx';
import { AccountSecurityPanels } from '../AccountSecurityPanels.tsx';
import {
  AccountProfileForm,
  DirectMessagesPanel,
  FriendsPanel,
  NotificationPreferencesPanel,
  SendNotificationPanel,
  TeamInvitationsPanel,
} from '../AccountSettingsPanels.tsx';
import {
  AuditLogPanel,
  AdminUsersPanel,
  FileScanForm,
  InfrastructureStatusPanel,
  ModerationQueue,
  ProjectModerationQueue,
  TaxonomyPanel,
} from '../AdminModerationPanels.tsx';
import {
  CollectionManagement,
  CreateOrganizationForm,
  OrganizationTeamManagementForm,
} from '../ContentManagementPanels.tsx';
import { ProjectAnalyticsPanel } from '../ProjectInsightsPanels.tsx';
import { ProjectMetadataForm } from '../ProjectMetadataForm.tsx';
import {
  AddGalleryImageForm,
  EditVersionDependencyForm,
  EditVersionForm,
  ProjectTeamManagementForm,
  PublishProjectForm,
  PublishVersionForm,
} from '../ProjectWorkflowPanels.tsx';
import { DashboardSummarySections } from './DashboardSummarySections.tsx';

export function DashboardSections({
  canAdmin,
  canModerate,
  dashboard,
  onOpenCollection,
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
  onOpenOrganization?: (slug: string) => void;
  onOpenProject: (mod: Mod) => void;
  onOpenProjectReference?: (project: SelectedProject) => void;
  onTagSearch?: (tag: SearchTag) => void;
  onUpdated: () => Promise<void>;
}) {
  return (
    <>
      <DashboardAccountSection
        canModerate={canModerate}
        dashboard={dashboard}
        onUpdated={onUpdated}
      />
      <DashboardSecuritySection />
      <DashboardContentSection dashboard={dashboard} onUpdated={onUpdated} />
      <DashboardProjectsSection dashboard={dashboard} onUpdated={onUpdated} />
      <DashboardCollectionsSection
        dashboard={dashboard}
        onUpdated={onUpdated}
      />
      {canModerate && (
        <DashboardModerationSection
          canAdmin={canAdmin}
          dashboard={dashboard}
          onOpenProject={onOpenProject}
        />
      )}
      <section id="dashboard-overview" className="scroll-mt-32">
        <DashboardSummarySections
          dashboard={dashboard}
          onOpenCollection={onOpenCollection}
          onOpenOrganization={onOpenOrganization}
          onOpenProject={onOpenProject}
          onOpenProjectReference={onOpenProjectReference}
          onTagSearch={onTagSearch}
          onUpdated={onUpdated}
        />
      </section>
    </>
  );
}

function DashboardAccountSection({
  canModerate,
  dashboard,
  onUpdated,
}: {
  canModerate: boolean;
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  return (
    <section id="dashboard-account" className="scroll-mt-32">
      <AccountProfileForm dashboard={dashboard} onUpdated={onUpdated} />
      <NotificationPreferencesPanel />
      <FriendsPanel />
      <TeamInvitationsPanel />
      <DirectMessagesPanel />
      {canModerate && <SendNotificationPanel />}
    </section>
  );
}

function DashboardSecuritySection() {
  return (
    <section id="dashboard-security" className="scroll-mt-32">
      <AccountSecurityPanels />
    </section>
  );
}

function DashboardContentSection({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  return (
    <section id="dashboard-content" className="scroll-mt-32">
      <CreateOrganizationForm
        organizations={dashboard.organizations}
        projects={dashboard.projects}
        onCreated={onUpdated}
      />

      {dashboard.organizations.length > 0 && (
        <OrganizationTeamManagementForm
          organizations={dashboard.organizations}
          onChanged={onUpdated}
        />
      )}
    </section>
  );
}

function DashboardProjectsSection({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  return (
    <section id="dashboard-projects" className="scroll-mt-32">
      <PublishProjectForm onCreated={onUpdated} />

      {dashboard.projects.length > 0 && (
        <>
          <ProjectMetadataForm
            projects={dashboard.projects}
            onUpdated={onUpdated}
          />
          <AddGalleryImageForm
            projects={dashboard.projects}
            onAdded={onUpdated}
          />
          <ProjectTeamManagementForm projects={dashboard.projects} />
          <ProjectAnalyticsPanel projects={dashboard.projects} />
          <EditVersionForm projects={dashboard.projects} />
          <EditVersionDependencyForm projects={dashboard.projects} />
          <PublishVersionForm projects={dashboard.projects} />
        </>
      )}
    </section>
  );
}

function DashboardCollectionsSection({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  return (
    <section id="dashboard-collections" className="scroll-mt-32">
      <CollectionManagement
        collections={dashboard.collections}
        ownerUsername={dashboard.username}
        projects={dashboard.projects}
        onChanged={onUpdated}
      />
    </section>
  );
}

function DashboardModerationSection({
  canAdmin,
  dashboard,
  onOpenProject,
}: {
  canAdmin: boolean;
  dashboard: DashboardData;
  onOpenProject: (mod: Mod) => void;
}) {
  return (
    <section id="dashboard-moderation" className="scroll-mt-32">
      {canAdmin && (
        <>
          <InfrastructureStatusPanel />
          <AuditLogPanel />
          <AdminUsersPanel viewerId={dashboard.id} />
          <TaxonomyPanel />
        </>
      )}
      <FileScanForm projects={dashboard.projects} />
      <ProjectModerationQueue onOpenProject={onOpenProject} />
      <ModerationQueue />
    </section>
  );
}
