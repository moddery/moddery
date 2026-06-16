import { useQuery } from '@tanstack/react-query';
import { type DependencyKind } from '@moddery/shared';
import { type FormEvent, useEffect, useState } from 'react';

import {
  addProjectGalleryImage,
  addProjectTeamMember,
  createProject,
  createVersion,
  removeProjectTeamMember,
  updateVersion,
  updateVersionDependencies,
  type CreateProjectInput,
  type CreateVersionInput,
  type DashboardData,
  type DashboardGalleryImage,
  type DashboardProject,
} from '../../lib/dashboard.ts';
import {
  fetchProjectVersions,
  type ProjectVersion,
} from '../../lib/catalog.ts';

export {
  AddGalleryImageForm,
  EditVersionDependencyForm,
  EditVersionForm,
  ProjectTeamManagementForm,
  PublishProjectForm,
  PublishVersionForm,
};

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
