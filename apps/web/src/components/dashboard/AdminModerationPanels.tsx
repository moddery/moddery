import { useQuery } from '@tanstack/react-query';
import { type ProjectKind } from '@moddery/shared';
import { Flag, FolderKanban } from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import {
  createReportThreadMessage,
  dashboardProjectToMod,
  fetchAdminUsers,
  fetchCategoryTaxonomy,
  fetchGameVersionTaxonomy,
  fetchModerationProjects,
  fetchModerationReports,
  fetchReportThread,
  moderateProject,
  recordFileScan,
  updateReportState,
  upsertCategory,
  upsertGameVersion,
  updateUserAccount,
  type AdminUserAccount,
  type CategoryTaxonomy,
  type DashboardProject,
  type ModerationReport,
  type ModerationReportState,
  type ReportThread,
} from '../../lib/dashboard.ts';
import { fetchProjectVersions } from '../../lib/catalog.ts';
import { timeAgo } from '../../lib/format.ts';
import { type Mod } from '../../types.ts';

export {
  AdminUsersPanel,
  FileScanForm,
  ModerationQueue,
  ProjectModerationQueue,
  TaxonomyPanel,
};

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
