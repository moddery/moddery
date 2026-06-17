import { Flag } from 'lucide-react';

import {
  type ModerationReport,
  type ModerationReportState,
} from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { projectTypeFromKind } from '../../../../lib/projectTypes.ts';
import { projectPath } from '../../../mod-card/ModCardParts.tsx';
import { ReportActionButton } from '../shared.tsx';
import { ReportThreadPanel } from './ReportThreadPanel.tsx';

export function ReportRow({
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
    report.version?.name ??
    report.project?.title ??
    report.userTarget?.displayName ??
    report.userTarget?.username ??
    report.versionId ??
    report.projectId ??
    report.userTargetId ??
    'Unknown target';
  const targetHref = report.version
    ? projectPath(
        projectTypeFromKind(report.version.project.kind),
        report.version.project.slug,
      )
    : report.project
      ? projectPath(
          projectTypeFromKind(report.project.kind),
          report.project.slug,
        )
      : report.userTarget
        ? `/users/${report.userTarget.username}`
        : null;
  const targetKind = report.version
    ? 'Version'
    : report.project
      ? 'Project'
      : report.userTarget
        ? 'User'
        : 'Unknown';
  const targetContext = report.version
    ? `${report.version.project.title} ${report.version.versionNumber}`
    : report.project
      ? report.project.slug
      : report.userTarget
        ? report.userTarget.username
        : null;
  const versionHref = report.version
    ? projectPath(
        projectTypeFromKind(report.version.project.kind),
        report.version.project.slug,
      )
    : null;

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Flag className="size-4 text-accent-icon" />
            {targetHref ? (
              <a
                href={targetHref}
                className="font-display text-lg font-extrabold text-ink transition-colors hover:text-accent"
              >
                {target}
              </a>
            ) : (
              <h3 className="font-display text-lg font-extrabold text-ink">
                {target}
              </h3>
            )}
            <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-bold uppercase text-muted">
              {targetKind}
            </span>
            <span className="rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted">
              {report.reason.replaceAll('_', ' ')}
            </span>
          </div>
          {report.version && (
            <p className="mt-1 text-xs font-bold text-muted">
              Version {report.version.versionNumber} for{' '}
              {versionHref ? (
                <a
                  href={versionHref}
                  className="text-ink transition-colors hover:text-accent"
                >
                  {report.version.project.title}
                </a>
              ) : (
                report.version.project.title
              )}
            </p>
          )}
          {!report.version && targetContext && (
            <p className="mt-1 text-xs font-bold text-muted">
              Target: {targetContext}
            </p>
          )}
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
            {report.closedAt ? ` · closed ${timeAgo(report.closedAt)}` : ''}
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
