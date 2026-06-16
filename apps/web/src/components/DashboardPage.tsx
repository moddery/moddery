import { useQuery } from '@tanstack/react-query';
import {
  type CollectionVisibility,
  type DependencyKind,
  type ProjectKind,
} from '@moddery/shared';
import {
  BookMarked,
  Bell,
  Building2,
  Flag,
  FolderKanban,
  Heart,
  KeyRound,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { type FormEvent, type ReactNode } from 'react';
import { useEffect, useState } from 'react';

import {
  addProjectGalleryImage,
  addProjectTeamMember,
  addProjectToCollection,
  addProjectToOrganization,
  createApiToken,
  createCollection,
  createOrganization,
  createProject,
  createReportThreadMessage,
  createVersion,
  dashboardProjectToMod,
  fetchAdminUsers,
  fetchCategoryTaxonomy,
  fetchDashboard,
  fetchGameVersionTaxonomy,
  fetchModerationProjects,
  fetchModerationReports,
  fetchNotificationPreferences,
  fetchReportThread,
  fetchViewerApiTokens,
  fetchViewerSessions,
  removeProjectFromCollection,
  removeProjectFromOrganization,
  removeProjectTeamMember,
  moderateProject,
  recordFileScan,
  revokeApiToken,
  revokeSession,
  sendNotification,
  updateCollection,
  updateNotificationPreference,
  updateOrganization,
  updateReportState,
  upsertCategory,
  upsertGameVersion,
  updateUserAccount,
  updateViewerProfile,
  updateVersion,
  updateVersionDependencies,
  type ApiTokenSummary,
  type AdminUserAccount,
  type CategoryTaxonomy,
  type CreateCollectionInput,
  type CreateOrganizationInput,
  type CreateProjectInput,
  type CreateVersionInput,
  type DashboardGalleryImage,
  type DashboardCollection,
  type DashboardData,
  type DashboardOrganization,
  type DashboardProject,
  type ModerationReport,
  type ModerationReportState,
  type NotificationPreference,
  type ReportThread,
  type SessionSummary,
  type UpdateCollectionInput,
  type UpdateOrganizationInput,
  type UpdateViewerProfileInput,
} from '../lib/dashboard.ts';
import { fetchProjectVersions, type ProjectVersion } from '../lib/catalog.ts';
import { timeAgo } from '../lib/format.ts';
import { type Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { ModCard } from './ModCard.tsx';
import { ProjectMetadataForm } from './dashboard/ProjectMetadataForm.tsx';

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

      <SessionsPanel />

      <ApiTokensPanel />

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

function EditVersionDependencyForm({
  projects,
}: {
  projects: DashboardData['projects'];
}) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const versionsQuery = useQuery({
    queryFn: ({ signal }) => fetchProjectVersions(projectSlug, signal),
    queryKey: ['dashboard', 'version-dependencies', projectSlug],
  });
  const versions = versionsQuery.data ?? [];
  const [versionId, setVersionId] = useState('');
  const selectedVersion =
    versions.find((version) => version.id === versionId) ?? versions[0] ?? null;
  const [dependencyKind, setDependencyKind] =
    useState<DependencyKind>('REQUIRED');
  const [targetProjectSlug, setTargetProjectSlug] = useState('');
  const [targetVersionId, setTargetVersionId] = useState('');
  const [externalFileName, setExternalFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (versionId === '' && versions[0]) {
      fillDependencyForm(versions[0]);
    }
  }, [versionId, versions]);

  function selectProject(slug: string) {
    setProjectSlug(slug);
    setVersionId('');
    fillDependencyForm(null);
    setError(null);
    setUpdated(null);
  }

  function fillDependencyForm(version: ProjectVersion | null) {
    const dependency = version?.dependencies[0];
    setVersionId(version?.id ?? '');
    setDependencyKind(dependency?.dependencyKind ?? 'REQUIRED');
    setTargetProjectSlug(dependency?.targetProject?.slug ?? '');
    setTargetVersionId(dependency?.targetVersion?.id ?? '');
    setExternalFileName(dependency?.externalFileName ?? '');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedVersion === null) return;
    setSubmitting(true);
    setError(null);
    setUpdated(null);

    try {
      const hasDependency =
        targetProjectSlug.trim() !== '' ||
        targetVersionId.trim() !== '' ||
        externalFileName.trim() !== '';
      const version = await updateVersionDependencies({
        dependencies: hasDependency
          ? [
              {
                dependencyKind,
                externalFileName: nullableText(externalFileName),
                targetProjectSlug: nullableText(targetProjectSlug),
                targetVersionId: nullableText(targetVersionId),
              },
            ]
          : [],
        versionId: selectedVersion.id,
      });
      setUpdated(`${version.name} ${version.versionNumber}`);
      await versionsQuery.refetch();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Dependency update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Edit version dependency
        </h2>
        <p className="text-sm leading-6 text-muted">
          Replace the dependency list for a version with a project, version, or
          external file dependency.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Project
            <select
              value={projectSlug}
              onChange={(event) => selectProject(event.target.value)}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {projects.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-ink">
            Version
            <select
              value={selectedVersion?.id ?? ''}
              onChange={(event) => {
                fillDependencyForm(
                  versions.find(
                    (version) => version.id === event.target.value,
                  ) ?? null,
                );
              }}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {versions.length === 0 ? (
                <option value="">No versions</option>
              ) : (
                versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name} {version.version_number}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        {versionsQuery.isLoading ? (
          <p className="py-2 text-sm font-semibold text-muted">
            Loading versions...
          </p>
        ) : selectedVersion === null ? (
          <p className="py-2 text-sm font-semibold text-muted">
            Publish a version before editing dependencies.
          </p>
        ) : (
          <>
            <label className="grid gap-1 text-sm font-bold text-ink">
              Dependency kind
              <select
                value={dependencyKind}
                onChange={(event) =>
                  setDependencyKind(event.target.value as DependencyKind)
                }
                className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
              >
                <option value="REQUIRED">Required</option>
                <option value="OPTIONAL">Optional</option>
                <option value="INCOMPATIBLE">Incompatible</option>
                <option value="EMBEDDED">Embedded</option>
              </select>
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <DashboardField
                label="Target project slug"
                value={targetProjectSlug}
                onChange={setTargetProjectSlug}
              />
              <DashboardField
                label="Target version ID"
                value={targetVersionId}
                onChange={setTargetVersionId}
              />
              <DashboardField
                label="External file"
                value={externalFileName}
                onChange={setExternalFileName}
              />
            </div>
          </>
        )}

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {updated && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            Updated dependencies for {updated}.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting || selectedVersion === null}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save dependencies'}
          </button>
        </div>
      </form>
    </section>
  );
}

function EditVersionForm({
  projects,
}: {
  projects: DashboardData['projects'];
}) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const versionsQuery = useQuery({
    queryFn: ({ signal }) => fetchProjectVersions(projectSlug, signal),
    queryKey: ['dashboard', 'versions', projectSlug],
  });
  const versions = versionsQuery.data ?? [];
  const [versionId, setVersionId] = useState('');
  const selectedVersion =
    versions.find((version) => version.id === versionId) ?? versions[0] ?? null;
  const [name, setName] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [channel, setChannel] = useState<'ALPHA' | 'BETA' | 'RELEASE'>(
    'RELEASE',
  );
  const [changelog, setChangelog] = useState('');
  const [loaders, setLoaders] = useState('');
  const [gameVersions, setGameVersions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (versionId === '' && versions[0]) {
      selectVersion(versions[0]);
    }
  }, [versionId, versions]);

  function selectProject(slug: string) {
    setProjectSlug(slug);
    setVersionId('');
    fillVersion(null);
    setError(null);
    setUpdated(null);
  }

  function selectVersion(version: ProjectVersion | null) {
    setVersionId(version?.id ?? '');
    fillVersion(version);
    setError(null);
    setUpdated(null);
  }

  function fillVersion(version: ProjectVersion | null) {
    setName(version?.name ?? '');
    setVersionNumber(version?.version_number ?? '');
    setChannel(versionChannelFromProjectVersion(version));
    setChangelog(version?.changelog ?? '');
    setLoaders(version?.loaders.join(', ') ?? '');
    setGameVersions(version?.game_versions.join(', ') ?? '');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedVersion === null) return;
    setSubmitting(true);
    setError(null);
    setUpdated(null);

    try {
      const version = await updateVersion({
        changelog: changelog.trim() || null,
        channel,
        gameVersions: splitList(gameVersions),
        loaders: splitList(loaders),
        name,
        versionId: selectedVersion.id,
        versionNumber,
      });
      setUpdated(`${version.name} ${version.versionNumber}`);
      await versionsQuery.refetch();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Version update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Edit a version
        </h2>
        <p className="text-sm leading-6 text-muted">
          Update release metadata, changelog, loaders, and game versions.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Project
            <select
              value={projectSlug}
              onChange={(event) => selectProject(event.target.value)}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {projects.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-ink">
            Version
            <select
              value={selectedVersion?.id ?? ''}
              onChange={(event) => {
                selectVersion(
                  versions.find(
                    (version) => version.id === event.target.value,
                  ) ?? null,
                );
              }}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {versions.length === 0 ? (
                <option value="">No versions</option>
              ) : (
                versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name} {version.version_number}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        {versionsQuery.isLoading ? (
          <p className="py-2 text-sm font-semibold text-muted">
            Loading versions...
          </p>
        ) : selectedVersion === null ? (
          <p className="py-2 text-sm font-semibold text-muted">
            Publish a version before editing release metadata.
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <DashboardField
                label="Name"
                value={name}
                onChange={setName}
                required
              />
              <DashboardField
                label="Version number"
                value={versionNumber}
                onChange={setVersionNumber}
                required
              />
              <label className="grid gap-1 text-sm font-bold text-ink">
                Channel
                <select
                  value={channel}
                  onChange={(event) =>
                    setChannel(
                      event.target.value as 'ALPHA' | 'BETA' | 'RELEASE',
                    )
                  }
                  className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
                >
                  <option value="RELEASE">Release</option>
                  <option value="BETA">Beta</option>
                  <option value="ALPHA">Alpha</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <DashboardField
                label="Loaders"
                value={loaders}
                onChange={setLoaders}
              />
              <DashboardField
                label="Game versions"
                value={gameVersions}
                onChange={setGameVersions}
              />
            </div>
            <label className="grid gap-1 text-sm font-bold text-ink">
              Changelog
              <textarea
                value={changelog}
                onChange={(event) => setChangelog(event.target.value)}
                className="min-h-24 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
              />
            </label>
          </>
        )}

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {updated && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            Updated {updated}.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting || selectedVersion === null}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save version'}
          </button>
        </div>
      </form>
    </section>
  );
}

function versionChannelFromProjectVersion(
  version: ProjectVersion | null,
): 'ALPHA' | 'BETA' | 'RELEASE' {
  if (version?.version_type === 'alpha') return 'ALPHA';
  if (version?.version_type === 'beta') return 'BETA';
  return 'RELEASE';
}

function AddGalleryImageForm({
  onAdded,
  projects,
}: {
  onAdded: () => Promise<void>;
  projects: DashboardProject[];
}) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const project = projects.find((item) => item.slug === projectSlug);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rawUrl, setRawUrl] = useState('');
  const [displayUrl, setDisplayUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreated(null);

    try {
      const project = await addProjectGalleryImage({
        description: nullableText(description),
        displayUrl,
        featured,
        projectSlug,
        rawUrl,
        sortOrder: sortOrder.trim() === '' ? null : Number(sortOrder),
        title: nullableText(title),
      });
      setCreated(project.title);
      setTitle('');
      setDescription('');
      setRawUrl('');
      setDisplayUrl('');
      setFeatured(false);
      setSortOrder('0');
      await onAdded();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Gallery image failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Add gallery image
        </h2>
        <p className="text-sm leading-6 text-muted">
          Add screenshots or preview media to a managed project.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Project
            <select
              value={projectSlug}
              onChange={(event) => {
                setProjectSlug(event.target.value);
                setCreated(null);
                setError(null);
              }}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {projects.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <DashboardField
            label="Sort order"
            value={sortOrder}
            onChange={setSortOrder}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <DashboardField label="Title" value={title} onChange={setTitle} />
          <label className="flex items-end gap-2 text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="mb-3 size-4 accent-accent"
            />
            Featured
          </label>
        </div>
        <DashboardField
          label="Raw image URL"
          value={rawUrl}
          onChange={setRawUrl}
          required
        />
        <DashboardField
          label="Display image URL"
          value={displayUrl}
          onChange={setDisplayUrl}
          required
        />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-24 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
        </label>

        {project && project.gallery.length > 0 && (
          <GalleryPreview images={project.gallery} />
        )}

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {created && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            Added image to {created}.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Adding...' : 'Add gallery image'}
          </button>
        </div>
      </form>
    </section>
  );
}

function GalleryPreview({ images }: { images: DashboardGalleryImage[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {images.slice(0, 4).map((image) => (
        <figure key={`${image.rawUrl}-${image.sortOrder}`} className="min-w-0">
          <img
            src={image.displayUrl}
            alt={image.title ?? ''}
            className="aspect-video w-full rounded-lg border border-line bg-surface-2 object-cover"
          />
          <figcaption className="mt-1 truncate text-xs font-semibold text-muted">
            {image.title ?? image.displayUrl}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function ProjectTeamManagementForm({
  projects,
}: {
  projects: DashboardProject[];
}) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Member');
  const [permissions, setPermissions] = useState('MANAGE_VERSIONS');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const members = await addProjectTeamMember({
        permissions: splitList(permissions),
        projectSlug,
        role,
        username,
      });
      setUsername('');
      setMessage(
        `Team now has ${members.length.toLocaleString('en-US')} members.`,
      );
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Team update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function removeMember() {
    setSubmitting(true);
    setMessage(null);

    try {
      const members = await removeProjectTeamMember({
        projectSlug,
        username,
      });
      setUsername('');
      setMessage(
        `Team now has ${members.length.toLocaleString('en-US')} members.`,
      );
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Team update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Manage project team
        </h2>
        <p className="text-sm leading-6 text-muted">
          Add an existing user to a project team or remove a non-owner member.
        </p>
      </div>

      <form
        onSubmit={(event) => void addMember(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Project
            <select
              value={projectSlug}
              onChange={(event) => setProjectSlug(event.target.value)}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {projects.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <DashboardField
            label="Username"
            value={username}
            onChange={setUsername}
            required
          />
          <DashboardField label="Role" value={role} onChange={setRole} />
        </div>
        <DashboardField
          label="Permissions"
          value={permissions}
          onChange={setPermissions}
          placeholder="MANAGE_VERSIONS, VIEW_ANALYTICS"
        />

        {message && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Add team member'}
          </button>
          <button
            type="button"
            disabled={submitting || username.trim() === ''}
            onClick={() => void removeMember()}
            className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove member
          </button>
        </div>
      </form>
    </section>
  );
}

function CreateOrganizationForm({
  onCreated,
  organizations,
  projects,
}: {
  onCreated: () => Promise<void>;
  organizations: DashboardOrganization[];
  projects: DashboardData['projects'];
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1d9bf0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: CreateOrganizationInput = {
      color: color.trim() || null,
      description: description.trim() || null,
      name,
      slug,
    };

    try {
      await createOrganization(input);
      setName('');
      setSlug('');
      setDescription('');
      setColor('#1d9bf0');
      await onCreated();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Organization creation failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Create an organization
        </h2>
        <p className="text-sm leading-6 text-muted">
          Create a creator group for shared ownership and project grouping.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <DashboardField
            label="Name"
            value={name}
            onChange={setName}
            required
          />
          <DashboardField
            label="Slug"
            value={slug}
            onChange={setSlug}
            required
          />
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
          <DashboardField
            label="Description"
            value={description}
            onChange={setDescription}
          />
          <DashboardField label="Color" value={color} onChange={setColor} />
        </div>

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create organization'}
          </button>
        </div>
      </form>

      {organizations.length > 0 && (
        <EditOrganizationForm
          organizations={organizations}
          onUpdated={onCreated}
        />
      )}

      {organizations.length > 0 && projects.length > 0 && (
        <>
          <AddProjectToOrganizationForm
            organizations={organizations}
            projects={projects}
            onAdded={onCreated}
          />
          <RemoveProjectFromOrganizationForm
            organizations={organizations}
            projects={projects}
            onRemoved={onCreated}
          />
        </>
      )}
    </section>
  );
}

function EditOrganizationForm({
  onUpdated,
  organizations,
}: {
  onUpdated: () => Promise<void>;
  organizations: DashboardOrganization[];
}) {
  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id ?? '',
  );
  const selected =
    organizations.find((organization) => organization.id === organizationId) ??
    organizations[0];
  const [name, setName] = useState(selected?.name ?? '');
  const [slug, setSlug] = useState(selected?.slug ?? '');
  const [description, setDescription] = useState(selected?.description ?? '');
  const [color, setColor] = useState(selected?.color ?? '#1d9bf0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next =
      organizations.find(
        (organization) => organization.id === organizationId,
      ) ?? organizations[0];

    if (next === undefined) return;

    setOrganizationId(next.id);
    setName(next.name);
    setSlug(next.slug);
    setDescription(next.description ?? '');
    setColor(next.color ?? '#1d9bf0');
  }, [organizationId, organizations]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: UpdateOrganizationInput = {
      color: color.trim() || null,
      description: description.trim() || null,
      name,
      organizationId,
      slug,
    };

    try {
      await updateOrganization(input);
      await onUpdated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Organization update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-5 grid gap-3 border-t border-line pt-5"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Organization
          <select
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <DashboardField label="Name" value={name} onChange={setName} required />
        <DashboardField label="Slug" value={slug} onChange={setSlug} required />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
        <DashboardField
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <DashboardField label="Color" value={color} onChange={setColor} />
      </div>

      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save organization'}
        </button>
      </div>
    </form>
  );
}

function AddProjectToOrganizationForm({
  onAdded,
  organizations,
  projects,
}: {
  onAdded: () => Promise<void>;
  organizations: DashboardOrganization[];
  projects: DashboardData['projects'];
}) {
  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id ?? '',
  );
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await addProjectToOrganization(organizationId, projectSlug);
      await onAdded();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Organization update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-5 grid gap-3 border-t border-line pt-5"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Organization
          <select
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add project to organization'}
        </button>
      </div>
    </form>
  );
}

function RemoveProjectFromOrganizationForm({
  onRemoved,
  organizations,
  projects,
}: {
  onRemoved: () => Promise<void>;
  organizations: DashboardOrganization[];
  projects: DashboardData['projects'];
}) {
  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id ?? '',
  );
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await removeProjectFromOrganization(organizationId, projectSlug);
      await onRemoved();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Organization update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-5 grid gap-3 border-t border-line pt-5"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Organization
          <select
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Removing...' : 'Remove from organization'}
        </button>
      </div>
    </form>
  );
}

function CollectionManagement({
  collections,
  onChanged,
  projects,
}: {
  collections: DashboardCollection[];
  onChanged: () => Promise<void>;
  projects: DashboardData['projects'];
}) {
  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Manage collections
        </h2>
        <p className="text-sm leading-6 text-muted">
          Create curated lists and add managed projects to them.
        </p>
      </div>

      <CreateCollectionForm onCreated={onChanged} />

      {collections.length > 0 && (
        <EditCollectionForm collections={collections} onUpdated={onChanged} />
      )}

      {collections.length > 0 && projects.length > 0 && (
        <>
          <AddProjectToCollectionForm
            collections={collections}
            projects={projects}
            onAdded={onChanged}
          />
          <RemoveProjectFromCollectionForm
            collections={collections}
            projects={projects}
            onRemoved={onChanged}
          />
        </>
      )}
    </section>
  );
}

function CreateCollectionForm({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1d9bf0');
  const [visibility, setVisibility] = useState<CollectionVisibility>('PRIVATE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: CreateCollectionInput = {
      color: color.trim() || null,
      description: description.trim() || null,
      name,
      slug,
      visibility,
    };

    try {
      await createCollection(input);
      setName('');
      setSlug('');
      setDescription('');
      setColor('#1d9bf0');
      setVisibility('PRIVATE');
      await onCreated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Collection creation failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mt-4 grid gap-3">
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardField label="Name" value={name} onChange={setName} required />
        <DashboardField label="Slug" value={slug} onChange={setSlug} required />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Visibility
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as CollectionVisibility)
            }
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
        <DashboardField
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <DashboardField label="Color" value={color} onChange={setColor} />
      </div>

      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create collection'}
        </button>
      </div>
    </form>
  );
}

function EditCollectionForm({
  collections,
  onUpdated,
}: {
  collections: DashboardCollection[];
  onUpdated: () => Promise<void>;
}) {
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? '');
  const selected =
    collections.find((collection) => collection.id === collectionId) ??
    collections[0];
  const [name, setName] = useState(selected?.name ?? '');
  const [slug, setSlug] = useState(selected?.slug ?? '');
  const [description, setDescription] = useState(selected?.description ?? '');
  const [color, setColor] = useState(selected?.color ?? '#1d9bf0');
  const [visibility, setVisibility] = useState<CollectionVisibility>(
    selected?.visibility ?? 'PRIVATE',
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next =
      collections.find((collection) => collection.id === collectionId) ??
      collections[0];

    if (next === undefined) return;

    setCollectionId(next.id);
    setName(next.name);
    setSlug(next.slug);
    setDescription(next.description ?? '');
    setColor(next.color ?? '#1d9bf0');
    setVisibility(next.visibility);
  }, [collectionId, collections]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: UpdateCollectionInput = {
      collectionId,
      color: color.trim() || null,
      description: description.trim() || null,
      name,
      slug,
      visibility,
    };

    try {
      await updateCollection(input);
      await onUpdated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Collection update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-5 grid gap-3 border-t border-line pt-5"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Collection
          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
        <DashboardField label="Name" value={name} onChange={setName} required />
        <DashboardField label="Slug" value={slug} onChange={setSlug} required />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem_12rem]">
        <DashboardField
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <DashboardField label="Color" value={color} onChange={setColor} />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Visibility
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as CollectionVisibility)
            }
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save collection'}
        </button>
      </div>
    </form>
  );
}

function AddProjectToCollectionForm({
  collections,
  onAdded,
  projects,
}: {
  collections: DashboardCollection[];
  onAdded: () => Promise<void>;
  projects: DashboardData['projects'];
}) {
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? '');
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await addProjectToCollection(collectionId, projectSlug);
      await onAdded();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Collection update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-5 grid gap-3 border-t border-line pt-5"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Collection
          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add project to collection'}
        </button>
      </div>
    </form>
  );
}

function RemoveProjectFromCollectionForm({
  collections,
  onRemoved,
  projects,
}: {
  collections: DashboardCollection[];
  onRemoved: () => Promise<void>;
  projects: DashboardData['projects'];
}) {
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? '');
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await removeProjectFromCollection(collectionId, projectSlug);
      await onRemoved();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Collection update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-5 grid gap-3 border-t border-line pt-5"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Collection
          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Removing...' : 'Remove from collection'}
        </button>
      </div>
    </form>
  );
}

function PublishVersionForm({
  projects,
}: {
  projects: DashboardData['projects'];
}) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [name, setName] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [channel, setChannel] =
    useState<CreateVersionInput['channel']>('RELEASE');
  const [changelog, setChangelog] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('0');
  const [sha1, setSha1] = useState('');
  const [sha256, setSha256] = useState('');
  const [loaders, setLoaders] = useState(projects[0]?.loaders.join(', ') ?? '');
  const [gameVersions, setGameVersions] = useState(
    projects[0]?.gameVersions.join(', ') ?? '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreated(null);

    try {
      const version = await createVersion({
        changelog: changelog.trim() || null,
        channel,
        files: [
          {
            fileName,
            hashes: versionFileHashes({ sha1, sha256 }),
            primary: true,
            sizeBytes: Number(fileSize),
            url: fileUrl,
          },
        ],
        gameVersions: splitList(gameVersions),
        loaders: splitList(loaders),
        name,
        projectSlug,
        versionNumber,
      });
      setCreated(`${version.name} ${version.versionNumber}`);
      setName('');
      setVersionNumber('');
      setChangelog('');
      setFileName('');
      setFileUrl('');
      setFileSize('0');
      setSha1('');
      setSha256('');
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Version creation failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Publish a version
        </h2>
        <p className="text-sm leading-6 text-muted">
          Add release metadata and an externally hosted file URL for a managed
          project.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Project
            <select
              value={projectSlug}
              onChange={(event) => setProjectSlug(event.target.value)}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {projects.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <DashboardField
            label="Name"
            value={name}
            onChange={setName}
            required
          />
          <DashboardField
            label="Version number"
            value={versionNumber}
            onChange={setVersionNumber}
            required
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Channel
            <select
              value={channel}
              onChange={(event) =>
                setChannel(event.target.value as CreateVersionInput['channel'])
              }
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              <option value="RELEASE">Release</option>
              <option value="BETA">Beta</option>
              <option value="ALPHA">Alpha</option>
            </select>
          </label>
          <DashboardField
            label="Loaders"
            value={loaders}
            onChange={setLoaders}
          />
          <DashboardField
            label="Game versions"
            value={gameVersions}
            onChange={setGameVersions}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_2fr_10rem]">
          <DashboardField
            label="File name"
            value={fileName}
            onChange={setFileName}
            required
          />
          <DashboardField
            label="File URL"
            value={fileUrl}
            onChange={setFileUrl}
            required
          />
          <DashboardField
            label="Size bytes"
            value={fileSize}
            onChange={setFileSize}
            required
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <DashboardField label="SHA-1" value={sha1} onChange={setSha1} />
          <DashboardField label="SHA-256" value={sha256} onChange={setSha256} />
        </div>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Changelog
          <textarea
            value={changelog}
            onChange={(event) => setChangelog(event.target.value)}
            className="min-h-24 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {created && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            Published {created}.
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Publishing...' : 'Publish version'}
          </button>
        </div>
      </form>
    </section>
  );
}

function PublishProjectForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CreateProjectInput['kind']>('MOD');
  const [loaders, setLoaders] = useState('fabric');
  const [gameVersions, setGameVersions] = useState('1.21.6');
  const [categories, setCategories] = useState('utility');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createProject({
        categories: splitList(categories),
        description,
        gameVersions: splitList(gameVersions),
        kind,
        loaders: splitList(loaders),
        slug,
        summary,
        title,
      });
      setTitle('');
      setSlug('');
      setSummary('');
      setDescription('');
      await onCreated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Project creation failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Publish a project
        </h2>
        <p className="text-sm leading-6 text-muted">
          Create a catalog entry with the core metadata needed for review and
          discovery.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <DashboardField
            label="Title"
            value={title}
            onChange={setTitle}
            required
          />
          <DashboardField
            label="Slug"
            value={slug}
            onChange={setSlug}
            required
          />
        </div>
        <DashboardField
          label="Summary"
          value={summary}
          onChange={setSummary}
          required
        />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Description
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Type
            <select
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as CreateProjectInput['kind'])
              }
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              <option value="MOD">Mod</option>
              <option value="MODPACK">Modpack</option>
              <option value="RESOURCE_PACK">Resource Pack</option>
              <option value="SHADER">Shader</option>
              <option value="PLUGIN">Plugin</option>
              <option value="DATAPACK">Data Pack</option>
            </select>
          </label>
          <DashboardField
            label="Loaders"
            value={loaders}
            onChange={setLoaders}
          />
          <DashboardField
            label="Game versions"
            value={gameVersions}
            onChange={setGameVersions}
          />
          <DashboardField
            label="Categories"
            value={categories}
            onChange={setCategories}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Publishing...' : 'Publish project'}
          </button>
        </div>
      </form>
    </section>
  );
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function versionFileHashes({
  sha1,
  sha256,
}: {
  sha1: string;
  sha256: string;
}): CreateVersionInput['files'][number]['hashes'] {
  return [
    { algorithm: 'SHA1', value: sha1.trim() },
    { algorithm: 'SHA256', value: sha256.trim() },
  ].filter((hash) => hash.value.length > 0);
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function DashboardField({
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      {label}
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
      />
    </label>
  );
}

function AdminUsersPanel({ viewerId }: { viewerId: string }) {
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const usersQuery = useQuery({
    queryFn: ({ signal }) => fetchAdminUsers(signal),
    queryKey: ['dashboard', 'admin-users'],
  });
  const users = usersQuery.data ?? [];

  async function updateAccount(
    user: AdminUserAccount,
    input: { role?: string; status?: string },
  ) {
    setBusyUserId(user.id);
    setMessage(null);
    try {
      await updateUserAccount({
        role: input.role ?? null,
        status: input.status ?? null,
        userId: user.id,
      });
      await usersQuery.refetch();
      setMessage(`Updated ${user.username}.`);
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'User update failed.',
      );
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            User accounts
          </h2>
          <p className="mt-1 text-sm text-muted">
            Recent accounts and moderation access.
          </p>
        </div>
        <ReportActionButton
          disabled={usersQuery.isFetching}
          onClick={() => void usersQuery.refetch()}
        >
          Refresh
        </ReportActionButton>
      </div>
      {message && (
        <p className="mt-3 text-sm font-semibold text-muted">{message}</p>
      )}
      {usersQuery.isLoading && (
        <p className="mt-4 text-sm text-muted">Loading users...</p>
      )}
      <div className="mt-4 grid gap-3">
        {users.map((user) => (
          <AdminUserRow
            key={user.id}
            busy={busyUserId === user.id}
            self={user.id === viewerId}
            user={user}
            onUpdate={updateAccount}
          />
        ))}
      </div>
    </section>
  );
}

function AdminUserRow({
  busy,
  onUpdate,
  self,
  user,
}: {
  busy: boolean;
  onUpdate: (
    user: AdminUserAccount,
    input: { role?: string; status?: string },
  ) => Promise<void>;
  self: boolean;
  user: AdminUserAccount;
}) {
  const roles = ['USER', 'MODERATOR', 'ADMIN'];
  const statuses = ['ACTIVE', 'SUSPENDED', 'DELETED'];

  return (
    <article className="rounded-lg border border-line bg-raised p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-extrabold text-ink">
            {user.displayName ?? user.username}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">
            @{user.username} · {user.role} · {user.status}
            {self ? ' · you' : ''}
          </p>
        </div>
        <span className="text-xs font-semibold text-muted">
          {timeAgo(user.createdAt)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {roles.map((role) => (
          <ReportActionButton
            key={role}
            disabled={busy || user.role === role || (self && role !== 'ADMIN')}
            tone={user.role === role ? 'strong' : 'default'}
            onClick={() => void onUpdate(user, { role })}
          >
            {role.toLowerCase()}
          </ReportActionButton>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <ReportActionButton
            key={status}
            disabled={
              busy || user.status === status || (self && status !== 'ACTIVE')
            }
            tone={user.status === status ? 'strong' : 'default'}
            onClick={() => void onUpdate(user, { status })}
          >
            {status.toLowerCase()}
          </ReportActionButton>
        ))}
      </div>
    </article>
  );
}

const taxonomyProjectKinds: Array<{ label: string; value: ProjectKind | '' }> =
  [
    { label: 'Any project kind', value: '' },
    { label: 'Mod', value: 'MOD' },
    { label: 'Modpack', value: 'MODPACK' },
    { label: 'Resource pack', value: 'RESOURCE_PACK' },
    { label: 'Shader', value: 'SHADER' },
    { label: 'Plugin', value: 'PLUGIN' },
    { label: 'Datapack', value: 'DATAPACK' },
  ];

function TaxonomyPanel() {
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryKind, setCategoryKind] = useState<ProjectKind | ''>('');
  const [gameVersion, setGameVersion] = useState('');
  const [gameVersionActive, setGameVersionActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => fetchCategoryTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-categories'],
  });
  const gameVersionsQuery = useQuery({
    queryFn: ({ signal }) => fetchGameVersionTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-game-versions'],
  });
  const categories = categoriesQuery.data ?? [];
  const gameVersions = gameVersionsQuery.data ?? [];

  function fillCategory(category: CategoryTaxonomy) {
    setCategorySlug(category.slug);
    setCategoryName(category.name);
    setCategoryDescription(category.description ?? '');
    setCategoryKind(category.projectKind ?? '');
    setMessage(null);
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const category = await upsertCategory({
        description: nullableText(categoryDescription),
        name: categoryName,
        projectKind: categoryKind === '' ? null : categoryKind,
        slug: categorySlug,
      });
      await categoriesQuery.refetch();
      setMessage(`Saved category ${category.slug}.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Category failed');
    } finally {
      setBusy(false);
    }
  }

  async function submitGameVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const saved = await upsertGameVersion({
        isActive: gameVersionActive,
        version: gameVersion,
      });
      await gameVersionsQuery.refetch();
      setMessage(`Saved game version ${saved.version}.`);
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Game version failed',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Taxonomy
          </h2>
          <p className="mt-1 text-sm text-muted">
            Manage category and game version rows used by discovery.
          </p>
        </div>
        <FolderKanban className="size-5 text-accent-icon" />
      </div>
      {message && (
        <p className="mt-3 text-sm font-semibold text-muted">{message}</p>
      )}

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <form
          onSubmit={(event) => void submitCategory(event)}
          className="grid gap-3"
        >
          <h3 className="font-display text-base font-extrabold text-ink">
            Category
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <DashboardField
              label="Slug"
              value={categorySlug}
              onChange={setCategorySlug}
              required
            />
            <DashboardField
              label="Name"
              value={categoryName}
              onChange={setCategoryName}
              required
            />
          </div>
          <label className="grid gap-1 text-sm font-bold text-ink">
            Project kind
            <select
              value={categoryKind}
              onChange={(event) =>
                setCategoryKind(event.target.value as ProjectKind | '')
              }
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {taxonomyProjectKinds.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>
          <DashboardField
            label="Description"
            value={categoryDescription}
            onChange={setCategoryDescription}
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save category
          </button>
          <TaxonomyCategoryList
            categories={categories}
            onSelect={fillCategory}
          />
        </form>

        <form
          onSubmit={(event) => void submitGameVersion(event)}
          className="grid content-start gap-3"
        >
          <h3 className="font-display text-base font-extrabold text-ink">
            Game version
          </h3>
          <DashboardField
            label="Version"
            value={gameVersion}
            onChange={setGameVersion}
            required
          />
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={gameVersionActive}
              onChange={(event) => setGameVersionActive(event.target.checked)}
              className="size-4 accent-accent"
            />
            Active
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save game version
          </button>
          <div className="mt-1 grid gap-2">
            {gameVersions.slice(0, 12).map((item) => (
              <button
                key={item.version}
                type="button"
                onClick={() => {
                  setGameVersion(item.version);
                  setGameVersionActive(item.isActive);
                }}
                className="flex items-center justify-between rounded-lg border border-line bg-control px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-control-hover"
              >
                <span>{item.version}</span>
                <span className="text-xs text-muted">
                  {item.isActive ? 'active' : 'inactive'}
                </span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}

function TaxonomyCategoryList({
  categories,
  onSelect,
}: {
  categories: CategoryTaxonomy[];
  onSelect: (category: CategoryTaxonomy) => void;
}) {
  if (categories.length === 0) {
    return (
      <p className="text-sm font-semibold text-muted">No categories yet.</p>
    );
  }

  return (
    <div className="mt-1 grid gap-2">
      {categories.slice(0, 12).map((category) => (
        <button
          key={category.slug}
          type="button"
          onClick={() => onSelect(category)}
          className="flex items-center justify-between gap-3 rounded-lg border border-line bg-control px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-control-hover"
        >
          <span>{category.name}</span>
          <span className="text-xs text-muted">{category.slug}</span>
        </button>
      ))}
    </div>
  );
}

function FileScanForm({ projects }: { projects: DashboardProject[] }) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const versionsQuery = useQuery({
    enabled: projectSlug !== '',
    queryFn: ({ signal }) => fetchProjectVersions(projectSlug, signal),
    queryKey: ['dashboard', 'file-scans', projectSlug],
  });
  const versions = versionsQuery.data ?? [];
  const [versionId, setVersionId] = useState('');
  const selectedVersion =
    versions.find((version) => version.id === versionId) ?? versions[0] ?? null;
  const files = selectedVersion?.files ?? [];
  const [fileId, setFileId] = useState('');
  const selectedFile = files.find((file) => file.id === fileId) ?? files[0];
  const [status, setStatus] = useState('COMPLETE');
  const [verdict, setVerdict] = useState('CLEAN');
  const [details, setDetails] = useState('{\n  "source": "manual"\n}');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setVersionId(versions[0]?.id ?? '');
  }, [versions]);

  useEffect(() => {
    setFileId(files[0]?.id ?? '');
  }, [files]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedFile === undefined) return;

    setBusy(true);
    setMessage(null);
    try {
      const version = await recordFileScan({
        details: nullableText(details),
        fileId: selectedFile.id,
        status,
        verdict: nullableText(verdict),
      });
      await versionsQuery.refetch();
      setMessage(`Recorded scan for ${version.name}.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Scan failed');
    } finally {
      setBusy(false);
    }
  }

  if (projects.length === 0) return null;

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Record file scan
        </h2>
        <p className="text-sm leading-6 text-muted">
          Attach a moderation scan result to a version file.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Project
            <select
              value={projectSlug}
              onChange={(event) => setProjectSlug(event.target.value)}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {projects.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-ink">
            Version
            <select
              value={selectedVersion?.id ?? ''}
              onChange={(event) => setVersionId(event.target.value)}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.name} {version.version_number}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-ink">
            File
            <select
              value={selectedFile?.id ?? ''}
              onChange={(event) => setFileId(event.target.value)}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              {files.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.filename}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <DashboardField label="Status" value={status} onChange={setStatus} />
          <DashboardField
            label="Verdict"
            value={verdict}
            onChange={setVerdict}
          />
        </div>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Details JSON
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            rows={4}
            className="rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || selectedFile === undefined}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Record scan
          </button>
          {message && (
            <span className="text-sm font-semibold text-muted">{message}</span>
          )}
        </div>
      </form>
    </section>
  );
}

function ProjectModerationQueue({
  onOpenProject,
}: {
  onOpenProject: (mod: Mod) => void;
}) {
  const [reason, setReason] = useState('');
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const projectsQuery = useQuery({
    queryFn: ({ signal }) => fetchModerationProjects(signal),
    queryKey: ['dashboard', 'moderation-projects'],
  });
  const projects = projectsQuery.data ?? [];

  async function act(projectSlug: string, action: string) {
    setBusySlug(projectSlug);
    setMessage(null);

    try {
      await moderateProject({
        action,
        projectSlug,
        reason: nullableText(reason),
      });
      await projectsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Project moderation failed',
      );
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Project review
        </h2>
        <span className="text-sm font-semibold text-muted">
          {projects.length.toLocaleString('en-US')} queued
        </span>
      </div>

      <label className="mt-4 grid gap-1 text-sm font-bold text-ink">
        Reason
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          placeholder="Optional moderation note"
        />
      </label>

      {projectsQuery.isLoading ? (
        <div className="mt-4 grid gap-3">
          <div className="h-24 animate-pulse rounded bg-surface-2" />
          <div className="h-24 animate-pulse rounded bg-surface-2" />
        </div>
      ) : projectsQuery.error ? (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {projectsQuery.error instanceof Error
            ? projectsQuery.error.message
            : 'Project review queue failed to load'}
        </p>
      ) : projects.length === 0 ? (
        <p className="py-8 text-sm text-muted">
          No projects are waiting on moderation.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectModerationRow
              busy={busySlug === project.slug}
              key={project.slug}
              onAction={act}
              onOpenProject={onOpenProject}
              project={project}
            />
          ))}
        </div>
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {message}
        </p>
      )}
    </section>
  );
}

function ProjectModerationRow({
  busy,
  onAction,
  onOpenProject,
  project,
}: {
  busy: boolean;
  onAction: (projectSlug: string, action: string) => Promise<void>;
  onOpenProject: (mod: Mod) => void;
  project: DashboardProject;
}) {
  const mod = dashboardProjectToMod(project);

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpenProject(mod)}
            className="text-left font-display text-lg font-extrabold text-ink transition-colors hover:text-accent"
          >
            {project.title}
          </button>
          <p className="mt-1 text-sm leading-6 text-muted">{project.summary}</p>
        </div>
        <span className="shrink-0 rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted">
          {project.status.replaceAll('_', ' ')}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.categories.slice(0, 4).map((category) => (
          <span
            key={category}
            className="rounded-md bg-control px-2 py-1 text-xs font-bold text-muted"
          >
            {category}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ReportActionButton
          disabled={busy}
          tone="strong"
          onClick={() => void onAction(project.slug, 'APPROVE')}
        >
          Approve
        </ReportActionButton>
        {project.status !== 'REJECTED' && (
          <ReportActionButton
            disabled={busy}
            onClick={() => void onAction(project.slug, 'REJECT')}
          >
            Reject
          </ReportActionButton>
        )}
        {project.status !== 'ARCHIVED' && (
          <ReportActionButton
            disabled={busy}
            onClick={() => void onAction(project.slug, 'ARCHIVE')}
          >
            Archive
          </ReportActionButton>
        )}
        {project.status === 'ARCHIVED' && (
          <ReportActionButton
            disabled={busy}
            onClick={() => void onAction(project.slug, 'RESTORE')}
          >
            Restore
          </ReportActionButton>
        )}
      </div>
    </article>
  );
}

function ModerationQueue() {
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const reportsQuery = useQuery({
    queryFn: ({ signal }) => fetchModerationReports(signal),
    queryKey: ['dashboard', 'moderation-reports'],
  });

  const reports = reportsQuery.data ?? [];
  async function setReportState(id: string, state: ModerationReportState) {
    setUpdatingReportId(id);
    try {
      await updateReportState(id, state);
      await reportsQuery.refetch();
    } finally {
      setUpdatingReportId(null);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Moderation queue
        </h2>
        <span className="text-sm font-semibold text-muted">
          {reports.length.toLocaleString('en-US')} active
        </span>
      </div>

      {reportsQuery.isLoading ? (
        <div className="mt-4 grid gap-3">
          <div className="h-24 animate-pulse rounded bg-surface-2" />
          <div className="h-24 animate-pulse rounded bg-surface-2" />
        </div>
      ) : reports.length === 0 ? (
        <p className="py-8 text-sm text-muted">No active reports.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {reports.map((report) => (
            <ReportRow
              key={report.id}
              report={report}
              disabled={updatingReportId === report.id}
              onStateChange={setReportState}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ReportRow({
  report,
  onStateChange,
  disabled,
}: {
  report: ModerationReport;
  disabled: boolean;
  onStateChange: (id: string, state: ModerationReportState) => Promise<void>;
}) {
  const reporterName =
    report.reporter?.displayName ?? report.reporter?.username ?? 'Unknown user';
  const target =
    report.project?.title ??
    report.userTarget?.displayName ??
    report.userTarget?.username ??
    report.versionId ??
    report.projectId ??
    report.userTargetId ??
    'Unknown target';

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Flag className="size-4 text-accent-icon" />
            <h3 className="font-display text-lg font-extrabold text-ink">
              {target}
            </h3>
            <span className="rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted">
              {report.reason.replaceAll('_', ' ')}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink">{report.body}</p>
          <p className="mt-3 text-sm font-semibold text-muted">
            Reported by{' '}
            {report.reporter ? (
              <a
                href={`/users/${report.reporter.username}`}
                className="text-ink transition-colors hover:text-accent"
              >
                {reporterName}
              </a>
            ) : (
              reporterName
            )}{' '}
            · {timeAgo(report.createdAt)}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-accent-soft px-2 py-1 text-xs font-bold uppercase text-accent">
          {report.state}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {report.state !== 'TRIAGED' && (
          <ReportActionButton
            disabled={disabled}
            onClick={() => onStateChange(report.id, 'TRIAGED')}
          >
            Triage
          </ReportActionButton>
        )}
        {report.state !== 'OPEN' && (
          <ReportActionButton
            disabled={disabled}
            onClick={() => onStateChange(report.id, 'OPEN')}
          >
            Reopen
          </ReportActionButton>
        )}
        <ReportActionButton
          disabled={disabled}
          tone="strong"
          onClick={() => onStateChange(report.id, 'CLOSED')}
        >
          Close
        </ReportActionButton>
      </div>
      <ReportThreadPanel reportId={report.id} />
    </article>
  );
}

function ReportThreadPanel({ reportId }: { reportId: string }) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadQuery = useQuery({
    queryFn: ({ signal }) => fetchReportThread(reportId, signal),
    queryKey: ['dashboard', 'report-thread', reportId],
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createReportThreadMessage({ body, reportId });
      setBody('');
      await threadQuery.refetch();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Reply failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <h4 className="text-sm font-extrabold text-ink">Discussion</h4>
      {threadQuery.isLoading ? (
        <p className="mt-2 text-sm font-semibold text-muted">
          Loading discussion...
        </p>
      ) : threadQuery.error ? (
        <p className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {threadQuery.error instanceof Error
            ? threadQuery.error.message
            : 'Discussion failed to load'}
        </p>
      ) : threadQuery.data ? (
        <ThreadMessages thread={threadQuery.data} />
      ) : (
        <p className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Discussion did not return from the API.
        </p>
      )}

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-3 grid gap-2"
      >
        <textarea
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-20 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          placeholder="Add a moderation note"
        />
        {error && (
          <p className="rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Posting...' : 'Post reply'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ThreadMessages({ thread }: { thread: ReportThread }) {
  if (thread.messages.length === 0) {
    return (
      <p className="mt-2 text-sm font-semibold text-muted">No replies yet.</p>
    );
  }

  return (
    <div className="mt-3 grid gap-2">
      {thread.messages.map((message) => {
        const author = message.author.displayName ?? message.author.username;

        return (
          <div key={message.id} className="rounded-lg bg-control px-3 py-2">
            <p className="text-sm leading-6 text-ink">{message.body}</p>
            <p className="mt-1 text-xs font-bold text-muted">
              {author} · {timeAgo(message.createdAt)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ReportActionButton({
  children,
  disabled,
  onClick,
  tone = 'default',
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
  tone?: 'default' | 'strong';
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        tone === 'strong'
          ? 'rounded-lg bg-accent px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60'
          : 'rounded-lg border border-line bg-control px-3 py-2 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      {children}
    </button>
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

function AccountProfileForm({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(dashboard.displayName ?? '');
  const [bio, setBio] = useState(dashboard.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(dashboard.avatarUrl ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(dashboard.displayName ?? '');
    setBio(dashboard.bio ?? '');
    setAvatarUrl(dashboard.avatarUrl ?? '');
  }, [dashboard.avatarUrl, dashboard.bio, dashboard.displayName]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const input: UpdateViewerProfileInput = {
      avatarUrl,
      bio,
      displayName,
    };

    try {
      await updateViewerProfile(input);
      await onUpdated();
      setMessage('Profile updated.');
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Profile update failed.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Profile
        </h2>
        <span className="text-sm font-semibold text-muted">
          @{dashboard.username}
        </span>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]"
      >
        <div className="grid size-20 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 text-muted">
          {avatarUrl.trim() ? (
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <UserRound className="size-7" />
          )}
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardField
              label="Display name"
              value={displayName}
              onChange={setDisplayName}
              placeholder={dashboard.username}
            />
            <DashboardField
              label="Avatar URL"
              value={avatarUrl}
              onChange={setAvatarUrl}
              placeholder="https://..."
            />
          </div>

          <label className="block text-sm font-bold text-ink">
            Bio
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={1000}
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-line bg-control px-3 py-2 text-sm font-normal text-ink outline-none placeholder:text-faint focus-visible:border-accent"
              placeholder="Short public profile bio"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save profile
            </button>
            {message && (
              <span className="text-sm font-semibold text-muted">
                {message}
              </span>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}

function NotificationPreferencesPanel() {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const preferencesQuery = useQuery({
    queryFn: ({ signal }) => fetchNotificationPreferences(signal),
    queryKey: ['dashboard', 'notification-preferences'],
  });
  const preferences = preferencesQuery.data;

  async function toggle(preference: NotificationPreference) {
    const key = preferenceKey(preference);
    setBusyKey(key);
    setMessage(null);

    try {
      await updateNotificationPreference({
        channel: preference.channel,
        enabled: !preference.enabled,
        type: preference.type,
      });
      await preferencesQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : 'Notification preference update failed',
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Notification preferences
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Choose where account, team, and moderation updates are delivered.
          </p>
        </div>
        <Bell className="size-5 text-accent-icon" />
      </div>

      {preferencesQuery.isLoading ? (
        <p className="mt-4 text-sm font-semibold text-muted">
          Loading preferences...
        </p>
      ) : preferencesQuery.error ? (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {preferencesQuery.error instanceof Error
            ? preferencesQuery.error.message
            : 'Notification preferences failed to load'}
        </p>
      ) : preferences === undefined ? (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Notification preferences did not return from the API.
        </p>
      ) : (
        <NotificationPreferenceGrid
          busyKey={busyKey}
          onToggle={toggle}
          preferences={preferences}
        />
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {message}
        </p>
      )}
    </section>
  );
}

function NotificationPreferenceGrid({
  busyKey,
  onToggle,
  preferences,
}: {
  busyKey: string | null;
  onToggle: (preference: NotificationPreference) => Promise<void>;
  preferences: NotificationPreference[];
}) {
  return (
    <div className="mt-4 grid gap-2">
      {preferences.map((preference) => {
        const key = preferenceKey(preference);

        return (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-display text-base font-extrabold capitalize text-ink">
                {preference.type}
              </p>
              <p className="mt-1 text-sm font-semibold text-muted">
                {preference.channel === 'EMAIL' ? 'Email' : 'In-app'} updates
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-bold text-ink">
              <input
                type="checkbox"
                checked={preference.enabled}
                disabled={busyKey === key}
                onChange={() => void onToggle(preference)}
                className="size-4 accent-accent"
              />
              {preference.enabled ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        );
      })}
    </div>
  );
}

function preferenceKey(preference: { channel: string; type: string }): string {
  return `${preference.type}:${preference.channel}`;
}

function SendNotificationPanel() {
  const [username, setUsername] = useState('');
  const [type, setType] = useState('moderation');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('/dashboard');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const notification = await sendNotification({
        actionUrl: nullableText(actionUrl),
        body: nullableText(body),
        title,
        type,
        username,
      });
      setMessage(`Sent ${notification.title} to ${username}.`);
      setTitle('');
      setBody('');
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Notification failed',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Send notification
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Queue a user notification and delivery records.
          </p>
        </div>
        <Bell className="size-5 text-accent-icon" />
      </div>
      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <DashboardField
            label="Username"
            value={username}
            onChange={setUsername}
            required
          />
          <DashboardField
            label="Type"
            value={type}
            onChange={setType}
            required
          />
          <DashboardField
            label="Action URL"
            value={actionUrl}
            onChange={setActionUrl}
          />
        </div>
        <DashboardField
          label="Title"
          value={title}
          onChange={setTitle}
          required
        />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Body
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send notification
          </button>
          {message && (
            <span className="text-sm font-semibold text-muted">{message}</span>
          )}
        </div>
      </form>
    </section>
  );
}

function SessionsPanel() {
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const sessionsQuery = useQuery({
    queryFn: ({ signal }) => fetchViewerSessions(signal),
    queryKey: ['dashboard', 'sessions'],
  });
  const sessions = sessionsQuery.data ?? [];

  async function revoke(sessionId: string) {
    setBusySessionId(sessionId);
    setMessage(null);

    try {
      await revokeSession(sessionId);
      await sessionsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Session revocation failed',
      );
    } finally {
      setBusySessionId(null);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Sessions
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Revoke browser sessions that should no longer have access.
          </p>
        </div>
        <ShieldCheck className="size-5 text-accent-icon" />
      </div>
      {message && (
        <p className="mt-3 text-sm font-semibold text-muted">{message}</p>
      )}
      <SessionList
        busySessionId={busySessionId}
        error={
          sessionsQuery.error instanceof Error
            ? sessionsQuery.error.message
            : null
        }
        onRevoke={revoke}
        sessions={sessions}
      />
    </section>
  );
}

function SessionList({
  busySessionId,
  error,
  onRevoke,
  sessions,
}: {
  busySessionId: string | null;
  error: string | null;
  onRevoke: (sessionId: string) => Promise<void>;
  sessions: SessionSummary[];
}) {
  if (error) {
    return (
      <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
        {error}
      </p>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="mt-4 text-sm font-semibold text-muted">
        No active sessions.
      </p>
    );
  }

  return (
    <div className="mt-4 grid gap-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-display text-base font-extrabold text-ink">
              {session.userAgent ?? 'Browser session'}
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">
              Created {timeAgo(session.createdAt)} · used{' '}
              {timeAgo(session.lastUsedAt)} · expires{' '}
              {timeAgo(session.expiresAt)}
            </p>
          </div>
          {session.revokedAt ? (
            <span className="text-sm font-bold text-muted">
              Revoked {timeAgo(session.revokedAt)}
            </span>
          ) : (
            <button
              type="button"
              disabled={busySessionId === session.id}
              onClick={() => void onRevoke(session.id)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Revoke
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function ApiTokensPanel() {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState('read:projects');
  const [expiresInDays, setExpiresInDays] = useState('90');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const tokensQuery = useQuery({
    queryFn: ({ signal }) => fetchViewerApiTokens(signal),
    queryKey: ['dashboard', 'api-tokens'],
  });
  const tokens = tokensQuery.data ?? [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setCreatedToken(null);

    try {
      const created = await createApiToken({
        expiresInDays:
          expiresInDays.trim() === '' ? null : Number(expiresInDays),
        name,
        scopes: splitList(scopes),
      });
      setCreatedToken(created.token);
      setName('');
      await tokensQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'API token creation failed',
      );
    } finally {
      setBusy(false);
    }
  }

  async function revoke(tokenId: string) {
    setBusy(true);
    setMessage(null);

    try {
      await revokeApiToken(tokenId);
      await tokensQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : 'API token revocation failed',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Personal access tokens
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Create bearer tokens for local tools and automation.
          </p>
        </div>
        <KeyRound className="size-5 text-accent-icon" />
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
          <DashboardField
            label="Token name"
            value={name}
            onChange={setName}
            required
          />
          <DashboardField label="Scopes" value={scopes} onChange={setScopes} />
          <DashboardField
            label="Expires in days"
            value={expiresInDays}
            onChange={setExpiresInDays}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create token
          </button>
          {message && (
            <span className="text-sm font-semibold text-muted">{message}</span>
          )}
        </div>
      </form>

      {createdToken && (
        <div className="mt-4 rounded-lg border border-line bg-control p-3">
          <p className="text-sm font-bold text-ink">Copy this token now.</p>
          <code className="mt-2 block overflow-x-auto rounded-md bg-surface px-3 py-2 text-sm text-ink">
            {createdToken}
          </code>
        </div>
      )}

      <ApiTokenList
        busy={busy || tokensQuery.isFetching}
        error={
          tokensQuery.error instanceof Error ? tokensQuery.error.message : null
        }
        onRevoke={revoke}
        tokens={tokens}
      />
    </section>
  );
}

function ApiTokenList({
  busy,
  error,
  onRevoke,
  tokens,
}: {
  busy: boolean;
  error: string | null;
  onRevoke: (tokenId: string) => Promise<void>;
  tokens: ApiTokenSummary[];
}) {
  if (error) {
    return (
      <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
        {error}
      </p>
    );
  }

  if (tokens.length === 0) {
    return (
      <p className="mt-4 text-sm font-semibold text-muted">
        No personal access tokens.
      </p>
    );
  }

  return (
    <div className="mt-4 grid gap-2">
      {tokens.map((token) => (
        <div
          key={token.id}
          className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-display text-base font-extrabold text-ink">
              {token.name}
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">
              {token.scopes.length > 0 ? token.scopes.join(', ') : 'No scopes'}{' '}
              · created {timeAgo(token.createdAt)}
              {token.lastUsedAt ? ` · used ${timeAgo(token.lastUsedAt)}` : ''}
              {token.expiresAt ? ` · expires ${timeAgo(token.expiresAt)}` : ''}
            </p>
          </div>
          {token.revokedAt ? (
            <span className="text-sm font-bold text-muted">
              Revoked {timeAgo(token.revokedAt)}
            </span>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onRevoke(token.id)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Revoke
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function OrganizationRow({
  organization,
}: {
  organization: DashboardOrganization;
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: organization.color ?? '#1d9bf0' }}
        />
        <a
          href={`/organizations/${organization.slug}`}
          className="font-display text-lg font-extrabold text-ink transition-colors hover:text-accent"
        >
          {organization.name}
        </a>
      </div>
      {organization.description && (
        <p className="mt-2 text-sm leading-6 text-muted">
          {organization.description}
        </p>
      )}
      <p className="mt-3 text-sm font-semibold text-muted">
        {organization.projectCount.toLocaleString('en-US')} projects ·{' '}
        {organization.memberCount.toLocaleString('en-US')} members · updated{' '}
        {timeAgo(organization.updatedAt)}
      </p>
    </article>
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

function CollectionRow({ collection }: { collection: DashboardCollection }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
        />
        <h3 className="font-display text-lg font-extrabold text-ink">
          {collection.name}
        </h3>
      </div>
      {collection.description && (
        <p className="mt-2 text-sm leading-6 text-muted">
          {collection.description}
        </p>
      )}
      <p className="mt-3 text-sm font-semibold text-muted">
        {collection.projectCount.toLocaleString('en-US')} projects · updated{' '}
        {timeAgo(collection.updatedAt)}
      </p>
    </article>
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
