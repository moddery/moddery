import { userPath } from '../../../../app/routing.ts';
import { type DashboardProject } from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { enumLabel } from '../../../../lib/labels.ts';

export function ProjectModerationLock({
  project,
}: {
  project: DashboardProject;
}) {
  if (project.moderationLock === null) {
    return null;
  }

  const moderator =
    project.moderationLock.moderator.displayName ??
    project.moderationLock.moderator.username;

  return (
    <p className="mt-3 rounded-md border border-line bg-control px-2 py-1.5 text-xs font-semibold text-muted">
      Locked by{' '}
      <a
        href={userPath(project.moderationLock.moderator.username)}
        className="text-ink transition-colors hover:text-accent"
      >
        {moderator}
      </a>{' '}
      until{' '}
      {new Date(project.moderationLock.expiresAt).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })}
    </p>
  );
}

export function ProjectLifecycle({ project }: { project: DashboardProject }) {
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

  return /^\d{4}-\d{2}-\d{2}T/.test(value) ? timeAgo(value) : enumLabel(value);
}
