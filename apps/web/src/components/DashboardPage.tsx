import { useQuery } from '@tanstack/react-query';
import { type CollectionVisibility } from '@moddery/shared';
import {
  BookMarked,
  Flag,
  FolderKanban,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { type FormEvent, type ReactNode } from 'react';
import { useState } from 'react';

import {
  addProjectToCollection,
  createCollection,
  createProject,
  createVersion,
  dashboardProjectToMod,
  fetchDashboard,
  fetchModerationReports,
  updateReportState,
  type CreateCollectionInput,
  type CreateProjectInput,
  type CreateVersionInput,
  type DashboardCollection,
  type DashboardData,
  type ModerationReport,
  type ModerationReportState,
} from '../lib/dashboard.ts';
import { timeAgo } from '../lib/format.ts';
import { type Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { ModCard } from './ModCard.tsx';

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

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <DashboardHeader dashboard={dashboard} />

      <PublishProjectForm
        onCreated={async () => {
          await dashboardQuery.refetch();
        }}
      />

      {dashboard.projects.length > 0 && (
        <PublishVersionForm projects={dashboard.projects} />
      )}

      <CollectionManagement
        collections={dashboard.collections}
        projects={dashboard.projects}
        onChanged={async () => {
          await dashboardQuery.refetch();
        }}
      />

      {canModerate && <ModerationQueue />}

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

      {collections.length > 0 && projects.length > 0 && (
        <AddProjectToCollectionForm
          collections={collections}
          projects={projects}
          onAdded={onChanged}
        />
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

function DashboardField({
  label,
  onChange,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      {label}
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
      />
    </label>
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
  const target = report.project?.title ?? report.projectId ?? 'Unknown target';

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
    </article>
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
          icon={<BookMarked className="size-4" />}
          label="Collections"
          value={dashboard.collectionCount}
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
