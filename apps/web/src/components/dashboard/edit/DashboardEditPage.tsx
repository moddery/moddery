import { ArrowLeft, Trash2 } from 'lucide-react';
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
import { EditCollectionForm } from '../content-management/EditCollectionForm.tsx';
import { EditOrganizationForm } from '../content-management/EditOrganizationForm.tsx';
import { ProjectMetadataForm } from '../ProjectMetadataForm.tsx';

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
  resolved: ResolvedTargetWithEditor;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

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
        description={resolved.description}
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

      {resolved.renderEditor(dashboard, onUpdated)}

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

interface ResolvedTargetWithEditor {
  delete: (() => Promise<boolean>) | null;
  description: string;
  entity: DashboardEditTarget['entity'];
  name: string;
  renderEditor: (
    dashboard: DashboardData,
    onUpdated: () => Promise<void>,
  ) => ReactNode;
  title: string;
  viewHref: string | null;
}

function resolveEditTarget(
  dashboard: DashboardData,
  target: DashboardEditTarget,
): ResolvedTargetWithEditor | null {
  if (target.entity === 'organizations') {
    const organization = dashboard.organizations.find(
      (item) => item.id === target.id,
    );
    if (!organization) return null;
    return {
      delete: () => deleteOrganization(organization.id),
      description: 'Update organization details, icon, and color.',
      entity: 'organizations',
      name: organization.name,
      renderEditor: (data, onUpdated) => (
        <EditOrganizationForm
          organizations={[organization]}
          onUpdated={onUpdated}
        />
      ),
      title: organization.name,
      viewHref: `/organizations/${encodeURIComponent(organization.slug)}`,
    };
  }

  if (target.entity === 'collections') {
    const collection = dashboard.collections.find(
      (item) => item.id === target.id,
    );
    if (!collection) return null;
    return {
      delete: () => deleteCollection(collection.id),
      description: 'Update collection details, visibility, and icon.',
      entity: 'collections',
      name: collection.name,
      renderEditor: (data, onUpdated) => (
        <EditCollectionForm collections={[collection]} onUpdated={onUpdated} />
      ),
      title: collection.name,
      viewHref: `/collections/${encodeURIComponent(
        dashboard.username,
      )}/${encodeURIComponent(collection.slug)}`,
    };
  }

  if (target.entity === 'projects') {
    const project = dashboard.projects.find((item) => item.slug === target.id);
    if (!project) return null;
    return {
      delete: () => deleteProject(project.slug),
      description: 'Update project copy, icon, links, and discovery tags.',
      entity: 'projects',
      name: project.title,
      renderEditor: (data, onUpdated) => (
        <ProjectMetadataForm projects={[project]} onUpdated={onUpdated} />
      ),
      title: project.title,
      viewHref: null,
    };
  }

  return null;
}
