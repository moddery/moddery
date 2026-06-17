import {
  dashboardProjectToMod,
  type DashboardProject,
} from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { type Mod } from '../../../../types.ts';
import { ReportActionButton } from '../shared.tsx';

export function ProjectModerationRow({
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
      <ProjectLifecycle project={project} />
      <ProjectModerationActions
        busy={busy}
        project={project}
        onAction={onAction}
      />
    </article>
  );
}

function ProjectLifecycle({ project }: { project: DashboardProject }) {
  const rows = [
    { label: 'Queued', value: project.queuedAt },
    { label: 'Requested', value: project.requestedStatus },
    { label: 'Published', value: project.publishedAt },
    { label: 'Approved', value: project.approvedAt },
    { label: 'Archived', value: project.archivedAt },
  ].filter((row) => row.value !== null && row.value !== undefined);

  if (rows.length === 0) {
    return null;
  }

  return (
    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-md bg-control px-2 py-1.5">
          <dt className="font-bold uppercase text-faint">{row.label}</dt>
          <dd className="mt-0.5 font-semibold text-muted">
            {formatLifecycleValue(row.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function formatLifecycleValue(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return /^\d{4}-\d{2}-\d{2}T/.test(value)
    ? timeAgo(value)
    : value.replaceAll('_', ' ');
}

function ProjectModerationActions({
  busy,
  onAction,
  project,
}: {
  busy: boolean;
  onAction: (projectSlug: string, action: string) => Promise<void>;
  project: DashboardProject;
}) {
  return (
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
  );
}
