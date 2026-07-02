import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { type DashboardEditTarget } from '../../../app/routing.ts';
import {
  deleteCollection,
  deleteOrganization,
  deleteProject,
  type DashboardData,
} from '../../../lib/dashboard.ts';
import {
  ConfirmDeleteDialog,
  DashboardPanel,
  PanelEmptyState,
  SectionHeader,
} from '../../ui/dashboard/index.ts';
import { CollectionManagement } from '../ContentManagementPanels.tsx';
import { EditCollectionForm } from '../content-management/EditCollectionForm.tsx';
import { EditOrganizationForm } from '../content-management/EditOrganizationForm.tsx';
import { OrganizationProjectForms } from '../content-management/OrganizationProjectForms.tsx';
import { OrganizationTeamManagementForm } from '../content-management/OrganizationTeamManagementForm.tsx';
import { useDashboardModal } from '../modals/DashboardModalProvider.tsx';
import { ProjectAnalyticsPanel } from '../ProjectInsightsPanels.tsx';
import { ProjectMetadataForm } from '../ProjectMetadataForm.tsx';
import {
  AddGalleryImageForm,
  EditVersionDependencyForm,
  EditVersionForm,
  ProjectTeamManagementForm,
} from '../ProjectWorkflowPanels.tsx';
import { workflowProjectHref } from '../project-workflow/version-route-links.ts';
import { DashboardEditTabs } from './DashboardEditTabs.tsx';

type DashboardProject = DashboardData['projects'][number];

export function DashboardEditPage({
  dashboard,
  onClose,
  onUpdated,
  target,
}: {
  dashboard: DashboardData;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  target: DashboardEditTarget;
}) {
  const resolved = resolveEditTarget(dashboard, target);

  return (
    <main className="mx-auto w-full max-w-[960px] px-4 pb-24 pt-5 sm:px-6">
      <button
        type="button"
        onClick={onClose}
        className="mb-5 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </button>

      {resolved === null ? (
        <DashboardPanel>
          <PanelEmptyState
            title="Item not found"
            body="It may have been deleted, or you no longer have access to it."
          />
        </DashboardPanel>
      ) : (
        <EditTargetEditor
          key={`${target.entity}:${target.id}`}
          dashboard={dashboard}
          onClose={onClose}
          onUpdated={onUpdated}
          resolved={resolved}
        />
      )}
    </main>
  );
}

function EditTargetEditor({
  dashboard,
  onClose,
  onUpdated,
  resolved,
}: {
  dashboard: DashboardData;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  resolved: ResolvedEditTarget;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState(resolved.tabs[0]?.id ?? '');
  const activeTab =
    resolved.tabs.find((tab) => tab.id === activeTabId) ?? resolved.tabs[0];

  async function handleDelete() {
    if (resolved.delete === null) return;
    await resolved.delete();
    await onUpdated();
    onClose();
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title={resolved.title}
        action={
          <div className="flex gap-2">
            {resolved.viewHref && (
              <a
                href={resolved.viewHref}
                className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover"
              >
                View public page
              </a>
            )}
            {resolved.delete && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-danger/40 bg-control px-4 text-sm font-bold text-danger transition-colors hover:bg-danger/10"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            )}
          </div>
        }
      />

      <DashboardEditTabs
        tabs={resolved.tabs}
        activeId={activeTab?.id ?? ''}
        onSelect={setActiveTabId}
      />

      {activeTab?.render(dashboard, onUpdated)}

      {resolved.delete && (
        <ConfirmDeleteDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={`Delete ${resolved.name}?`}
          description={`This permanently deletes ${resolved.name}. This action cannot be undone.`}
          confirmPhrase={resolved.name}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function ProjectVersionsTab({ project }: { project: DashboardProject }) {
  const { openModal } = useDashboardModal();

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => openModal('version')}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
        >
          <Upload className="size-4" />
          Upload version
        </button>
      </div>
      <EditVersionForm defaultOpen projects={[project]} />
      <EditVersionDependencyForm projects={[project]} />
    </div>
  );
}

interface EditTab {
  id: string;
  label: string;
  render: (
    dashboard: DashboardData,
    onUpdated: () => Promise<void>,
  ) => ReactNode;
}

interface ResolvedEditTarget {
  delete: (() => Promise<boolean>) | null;
  name: string;
  tabs: EditTab[];
  title: string;
  viewHref: string | null;
}

function resolveEditTarget(
  dashboard: DashboardData,
  target: DashboardEditTarget,
): ResolvedEditTarget | null {
  if (target.entity === 'organizations') {
    const organization = dashboard.organizations.find(
      (item) => item.id === target.id,
    );
    if (!organization) return null;

    const tabs: EditTab[] = [
      {
        id: 'details',
        label: 'Details',
        render: (data, onUpdated) => (
          <EditOrganizationForm
            organizations={[organization]}
            onUpdated={onUpdated}
          />
        ),
      },
      {
        id: 'members',
        label: 'Members',
        render: (data, onUpdated) => (
          <OrganizationTeamManagementForm
            defaultOpen
            organizations={[organization]}
            onChanged={onUpdated}
          />
        ),
      },
    ];

    if (dashboard.projects.length > 0) {
      tabs.push({
        id: 'projects',
        label: 'Projects',
        render: (data, onUpdated) => (
          <DashboardPanel>
            <SectionHeader
              title="Organization projects"
              description="Move managed projects in or out of this organization."
            />
            <OrganizationProjectForms
              organizations={[organization]}
              projects={data.projects}
              onChanged={onUpdated}
            />
          </DashboardPanel>
        ),
      });
    }

    return {
      delete: () => deleteOrganization(organization.id),
      name: organization.name,
      tabs,
      title: organization.name,
      viewHref: `/organizations/${encodeURIComponent(organization.slug)}`,
    };
  }

  if (target.entity === 'collections') {
    const collection = dashboard.collections.find(
      (item) => item.id === target.id,
    );
    if (!collection) return null;

    const tabs: EditTab[] = [
      {
        id: 'details',
        label: 'Details',
        render: (data, onUpdated) => (
          <EditCollectionForm
            collections={[collection]}
            onUpdated={onUpdated}
          />
        ),
      },
    ];

    if (dashboard.projects.length > 0) {
      tabs.push({
        id: 'projects',
        label: 'Projects',
        render: (data, onUpdated) => (
          <DashboardPanel>
            <SectionHeader
              title="Collection projects"
              description="Add managed projects to this collection and set their order."
            />
            <CollectionManagement
              collections={[collection]}
              ownerUsername={data.username}
              projects={data.projects}
              onChanged={onUpdated}
            />
          </DashboardPanel>
        ),
      });
    }

    return {
      delete: () => deleteCollection(collection.id),
      name: collection.name,
      tabs,
      title: collection.name,
      viewHref: `/collections/${encodeURIComponent(
        dashboard.username,
      )}/${encodeURIComponent(collection.slug)}`,
    };
  }

  if (target.entity === 'projects') {
    const project = dashboard.projects.find((item) => item.slug === target.id);
    if (!project) return null;

    const capabilities = project.viewerCapabilities;
    const tabs: EditTab[] = [];

    if (capabilities?.manageDetails === true) {
      tabs.push({
        id: 'details',
        label: 'Details',
        render: (data, onUpdated) => (
          <ProjectMetadataForm projects={[project]} onUpdated={onUpdated} />
        ),
      });
    }

    if (capabilities?.manageVersions === true) {
      tabs.push({
        id: 'versions',
        label: 'Versions',
        render: () => <ProjectVersionsTab project={project} />,
      });
    }

    if (capabilities?.manageDetails === true) {
      tabs.push({
        id: 'gallery',
        label: 'Gallery',
        render: (data, onUpdated) => (
          <AddGalleryImageForm
            defaultOpen
            projects={[project]}
            onAdded={onUpdated}
          />
        ),
      });
    }

    if (capabilities?.manageMembers === true) {
      tabs.push({
        id: 'team',
        label: 'Team',
        render: () => (
          <ProjectTeamManagementForm defaultOpen projects={[project]} />
        ),
      });
    }

    if (capabilities?.viewAnalytics === true) {
      tabs.push({
        id: 'analytics',
        label: 'Analytics',
        render: () => <ProjectAnalyticsPanel projects={[project]} />,
      });
    }

    if (tabs.length === 0) return null;

    return {
      delete:
        capabilities?.manageDetails === true
          ? () => deleteProject(project.slug)
          : null,
      name: project.title,
      tabs,
      title: project.title,
      viewHref: workflowProjectHref(project),
    };
  }

  return null;
}
