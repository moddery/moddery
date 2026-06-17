import { type DashboardProject } from '../../../../lib/dashboard.ts';
import { ReportActionButton } from '../shared.tsx';

export function ProjectModerationActions({
  busy,
  onAction,
  onLock,
  onReleaseLock,
  project,
}: {
  busy: boolean;
  onAction: (projectSlug: string, action: string) => Promise<void>;
  onLock: (projectSlug: string) => Promise<void>;
  onReleaseLock: (projectSlug: string) => Promise<void>;
  project: DashboardProject;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <ReportActionButton
        disabled={busy}
        onClick={() => void onLock(project.slug)}
      >
        Lock
      </ReportActionButton>
      {project.moderationLock !== null && (
        <ReportActionButton
          disabled={busy}
          onClick={() => void onReleaseLock(project.slug)}
        >
          Release lock
        </ReportActionButton>
      )}
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
