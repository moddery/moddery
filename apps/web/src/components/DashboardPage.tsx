import { useQuery } from '@tanstack/react-query';
import {
  BookMarked,
  Building2,
  FolderKanban,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { type ReactNode } from 'react';

import {
  dashboardProjectToMod,
  fetchDashboard,
  type DashboardCollection,
  type DashboardData,
  type DashboardOrganization,
} from '../lib/dashboard.ts';
import { timeAgo } from '../lib/format.ts';
import { type Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { ModCard } from './ModCard.tsx';
import { AccountSecurityPanels } from './dashboard/AccountSecurityPanels.tsx';
import {
  AccountProfileForm,
  NotificationPreferencesPanel,
  SendNotificationPanel,
} from './dashboard/AccountSettingsPanels.tsx';
import {
  AdminUsersPanel,
  FileScanForm,
  ModerationQueue,
  ProjectModerationQueue,
  TaxonomyPanel,
} from './dashboard/AdminModerationPanels.tsx';
import {
  CollectionManagement,
  CollectionRow,
  CreateOrganizationForm,
  OrganizationRow,
} from './dashboard/ContentManagementPanels.tsx';
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
  onOpenProject,
}: {
  onOpenProject: (mod: Mod) => void;
}) {
  const dashboardQuery = useQuery({
    queryFn: ({ signal }) => fetchDashboard(signal),
    queryKey: ['dashboard'],
    retry: false,
  });

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

  if (!dashboardQuery.data) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState
          onClear={() => window.location.assign('/')}
          itemLabel="account"
        />
      </main>
    );
  }

  const dashboard = dashboardQuery.data;
  const canModerate =
    dashboard.role === 'ADMIN' || dashboard.role === 'MODERATOR';
  const canAdmin = dashboard.role === 'ADMIN';

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <DashboardHeader dashboard={dashboard} />

      <AccountProfileForm
        dashboard={dashboard}
        onUpdated={async () => {
          await dashboardQuery.refetch();
        }}
      />

      <NotificationPreferencesPanel />

      {canModerate && <SendNotificationPanel />}

      <AccountSecurityPanels />

      <CreateOrganizationForm
        organizations={dashboard.organizations}
        projects={dashboard.projects}
        onCreated={async () => {
          await dashboardQuery.refetch();
        }}
      />

      <PublishProjectForm
        onCreated={async () => {
          await dashboardQuery.refetch();
        }}
      />

      {dashboard.projects.length > 0 && (
        <>
          <ProjectMetadataForm
            projects={dashboard.projects}
            onUpdated={async () => {
              await dashboardQuery.refetch();
            }}
          />
          <AddGalleryImageForm
            projects={dashboard.projects}
            onAdded={async () => {
              await dashboardQuery.refetch();
            }}
          />
          <ProjectTeamManagementForm projects={dashboard.projects} />
          <EditVersionForm projects={dashboard.projects} />
          <EditVersionDependencyForm projects={dashboard.projects} />
          <PublishVersionForm projects={dashboard.projects} />
        </>
      )}

      <CollectionManagement
        collections={dashboard.collections}
        projects={dashboard.projects}
        onChanged={async () => {
          await dashboardQuery.refetch();
        }}
      />

      {canModerate && (
        <>
          {canAdmin && (
            <>
              <AdminUsersPanel viewerId={dashboard.id} />
              <TaxonomyPanel />
            </>
          )}
          <FileScanForm projects={dashboard.projects} />
          <ProjectModerationQueue onOpenProject={onOpenProject} />
          <ModerationQueue />
        </>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Organizations
          </h2>
          <span className="text-sm font-semibold text-muted">
            {dashboard.organizations.length.toLocaleString('en-US')} total
          </span>
        </div>

        {dashboard.organizations.length === 0 ? (
          <p className="py-8 text-sm text-muted">
            Creator groups you own will show up here.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {dashboard.organizations.map((organization) => (
              <OrganizationRow
                key={organization.id}
                organization={organization}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Your projects
          </h2>
          <span className="text-sm font-semibold text-muted">
            {dashboard.projectCount.toLocaleString('en-US')} total
          </span>
        </div>

        {dashboard.projects.length === 0 ? (
          <p className="py-8 text-sm text-muted">
            Published projects you manage will show up here.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {dashboard.projects.map((project) => {
              const mod = dashboardProjectToMod(project);
              return (
                <ModCard
                  key={project.slug}
                  mod={mod}
                  layout="list"
                  onOpen={onOpenProject}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Collections
          </h2>
          <span className="text-sm font-semibold text-muted">
            {dashboard.collectionCount.toLocaleString('en-US')} total
          </span>
        </div>

        {dashboard.collections.length === 0 ? (
          <p className="py-8 text-sm text-muted">
            Public collections you own will show up here.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {dashboard.collections.map((collection) => (
              <CollectionRow key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function DashboardHeader({ dashboard }: { dashboard: DashboardData }) {
  const displayName = dashboard.displayName ?? dashboard.username;

  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Dashboard
          </h1>
          <p className="mt-2 text-sm font-semibold text-muted">
            Managing as{' '}
            <a
              href={`/users/${dashboard.username}`}
              className="text-ink transition-colors hover:text-accent"
            >
              {displayName}
            </a>
          </p>
        </div>
        {dashboard.isAdmin && (
          <span className="inline-flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-accent">
            <ShieldCheck className="size-4" />
            Admin account
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <DashboardStat
          icon={<FolderKanban className="size-4" />}
          label="Projects"
          value={dashboard.projectCount}
        />
        <DashboardStat
          icon={<Building2 className="size-4" />}
          label="Organizations"
          value={dashboard.organizations.length}
        />
        <DashboardStat
          icon={<Heart className="size-4" />}
          label="Following"
          value={dashboard.followedProjectCount}
        />
      </div>
    </header>
  );
}

function DashboardStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <div className="mt-1 text-lg font-extrabold text-ink tabular-nums">
        {value.toLocaleString('en-US')}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <div className="border-b border-line pb-6">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-2" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded bg-surface-2" />
        <div className="h-28 animate-pulse rounded bg-surface-2" />
      </div>
    </main>
  );
}
