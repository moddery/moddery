import { Flag } from 'lucide-react';

import { type ModerationReport } from '../../../../lib/dashboard.ts';
import { projectTypeFromKind } from '../../../../lib/projectTypes.ts';
import { projectPath } from '../../../mod-card/ModCardParts.tsx';

export function ReportTargetSummary({ report }: { report: ModerationReport }) {
  const target = resolveReportTarget(report);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Flag className="size-4 text-accent-icon" />
        {target.href ? (
          <a
            href={target.href}
            className="font-display text-lg font-extrabold text-ink transition-colors hover:text-accent"
          >
            {target.name}
          </a>
        ) : (
          <h3 className="font-display text-lg font-extrabold text-ink">
            {target.name}
          </h3>
        )}
        <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-bold uppercase text-muted">
          {target.kind}
        </span>
        <span className="rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted">
          {report.reason.replaceAll('_', ' ')}
        </span>
      </div>
      {target.version ? (
        <p className="mt-1 text-xs font-bold text-muted">
          Version {target.version.versionNumber} for{' '}
          {target.version.projectHref ? (
            <a
              href={target.version.projectHref}
              className="text-ink transition-colors hover:text-accent"
            >
              {target.version.projectTitle}
            </a>
          ) : (
            target.version.projectTitle
          )}
        </p>
      ) : target.context ? (
        <p className="mt-1 text-xs font-bold text-muted">
          Target: {target.context}
        </p>
      ) : null}
    </>
  );
}

function resolveReportTarget(report: ModerationReport) {
  if (report.version) {
    const projectHref = projectPath(
      projectTypeFromKind(report.version.project.kind),
      report.version.project.slug,
    );

    return {
      context: null,
      href: projectHref,
      kind: 'Version',
      name: report.version.name,
      version: {
        projectHref,
        projectTitle: report.version.project.title,
        versionNumber: report.version.versionNumber,
      },
    };
  }

  if (report.project) {
    return {
      context: report.project.slug,
      href: projectPath(
        projectTypeFromKind(report.project.kind),
        report.project.slug,
      ),
      kind: 'Project',
      name: report.project.title,
      version: null,
    };
  }

  if (report.userTarget) {
    return {
      context: report.userTarget.username,
      href: `/users/${report.userTarget.username}`,
      kind: 'User',
      name: report.userTarget.displayName ?? report.userTarget.username,
      version: null,
    };
  }

  return {
    context:
      report.versionId ?? report.projectId ?? report.userTargetId ?? null,
    href: null,
    kind: 'Unknown',
    name:
      report.versionId ??
      report.projectId ??
      report.userTargetId ??
      'Unknown target',
    version: null,
  };
}
