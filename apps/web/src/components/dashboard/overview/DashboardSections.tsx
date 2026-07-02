import {
  type DashboardEditTarget,
  type SelectedProject,
} from '../../../app/routing.ts';
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
  ReleaseModerationQueue,
  TaxonomyPanel,
} from '../AdminModerationPanels.tsx';
import { SectionHeader } from '../../ui/dashboard/index.ts';
import { DashboardEntityList } from '../edit/DashboardEntityList.tsx';
import { useDashboardModal } from '../modals/DashboardModalProvider.tsx';
import { type DashboardSectionId } from './dashboardSectionItems.ts';
import { DashboardSummarySections } from './DashboardSummarySections.tsx';

function CreateButton({
  label,
  onClick,
  variant = 'primary',
}: {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === 'primary'
          ? 'inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong'
          : 'inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover'
      }
    >
      {label}
    </button>
  );
}

export function DashboardSections({
  activeId,
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
  activeId: DashboardSectionId;
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
  switch (activeId) {
    case 'dashboard-overview':
      return (
        <section id="dashboard-overview" className="space-y-5">
          <DashboardSummarySections dashboard={dashboard} />
        </section>
      );
    case 'dashboard-projects':
      return (
        <DashboardProjectsSection
          dashboard={dashboard}
          onOpenEdit={onOpenEdit}
        />
      );
    case 'dashboard-content':
      return (
        <DashboardContentSection
          dashboard={dashboard}
          onOpenEdit={onOpenEdit}
        />
      );
    case 'dashboard-collections':
      return (
        <DashboardCollectionsSection
          dashboard={dashboard}
          onOpenEdit={onOpenEdit}
        />
      );
    case 'dashboard-account':
      return (
        <DashboardAccountSection
          canModerate={canModerate}
          dashboard={dashboard}
          onUpdated={onUpdated}
        />
      );
    case 'dashboard-security':
      return (
        <DashboardSecuritySection dashboard={dashboard} onUpdated={onUpdated} />
      );
    case 'dashboard-moderation':
      return canModerate ? (
        <DashboardModerationSection
          canAdmin={canAdmin}
          dashboard={dashboard}
          onOpenProject={onOpenProject}
        />
      ) : null;
  }
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
    <section id="dashboard-account" className="space-y-5">
      <AccountProfileForm dashboard={dashboard} onUpdated={onUpdated} />
      <NotificationPreferencesPanel />
      <FriendsPanel />
      <TeamInvitationsPanel />
      <DirectMessagesPanel viewerId={dashboard.id} />
      {canModerate && <SendNotificationPanel />}
    </section>
  );
}

function DashboardSecuritySection({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  return (
    <section id="dashboard-security" className="space-y-5">
      <AccountSecurityPanels dashboard={dashboard} onUpdated={onUpdated} />
    </section>
  );
}

function DashboardContentSection({
  dashboard,
  onOpenEdit,
}: {
  dashboard: DashboardData;
  onOpenEdit?: (target: DashboardEditTarget) => void;
}) {
  const { openModal } = useDashboardModal();

  return (
    <section id="dashboard-content" className="space-y-5">
      <SectionHeader
        title="Organizations"
        action={
          <CreateButton
            label="Create organization"
            onClick={() => openModal('organization')}
          />
        }
      />

      <DashboardEntityList
        emptyTitle="No organizations yet"
        emptyBody="Create an organization to start grouping projects."
        rows={dashboard.organizations.map((organization) => ({
          iconUrl: organization.iconUrl,
          id: organization.id,
          meta: `${organization.projectCount.toLocaleString('en-US')} projects`,
          name: organization.name,
        }))}
        onEdit={(id) => onOpenEdit?.({ entity: 'organizations', id })}
      />
    </section>
  );
}

function DashboardProjectsSection({
  dashboard,
  onOpenEdit,
}: {
  dashboard: DashboardData;
  onOpenEdit?: (target: DashboardEditTarget) => void;
}) {
  const manageableProjects = dashboard.projects.filter(
    (project) => project.viewerCapabilities?.manageDetails === true,
  );

  return (
    <section id="dashboard-projects" className="space-y-5">
      <SectionHeader title="Projects" />
      <DashboardEntityList
        emptyTitle="No editable projects"
        emptyBody="Publish a project to manage its metadata here."
        rows={manageableProjects.map((project) => ({
          iconUrl: project.iconUrl,
          id: project.slug,
          meta: project.status,
          name: project.title,
        }))}
        onEdit={(id) => onOpenEdit?.({ entity: 'projects', id })}
      />
    </section>
  );
}

function DashboardCollectionsSection({
  dashboard,
  onOpenEdit,
}: {
  dashboard: DashboardData;
  onOpenEdit?: (target: DashboardEditTarget) => void;
}) {
  const { openModal } = useDashboardModal();

  return (
    <section id="dashboard-collections" className="space-y-5">
      <SectionHeader
        title="Collections"
        action={
          <CreateButton
            label="Create collection"
            onClick={() => openModal('collection')}
          />
        }
      />
      <DashboardEntityList
        emptyTitle="No collections yet"
        emptyBody="Create a collection to start curating projects."
        rows={dashboard.collections.map((collection) => ({
          iconUrl: collection.iconUrl,
          id: collection.id,
          meta: `${collection.projectCount.toLocaleString('en-US')} projects · ${collection.visibility.toLowerCase()}`,
          name: collection.name,
        }))}
        onEdit={(id) => onOpenEdit?.({ entity: 'collections', id })}
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
    <section id="dashboard-moderation" className="space-y-5">
      {canAdmin && (
        <>
          <InfrastructureStatusPanel />
          <AuditLogPanel />
          <AdminUsersPanel viewerId={dashboard.id} />
          <TaxonomyPanel />
        </>
      )}
      <ProjectModerationQueue onOpenProject={onOpenProject} />
      <ReleaseModerationQueue />
      <FileScanForm projects={dashboard.projects} />
      <ModerationQueue />
    </section>
  );
}
