import { organizationPath, userPath } from '../../../../app/routing.ts';
import {
  dashboardProjectToMod,
  type DashboardProject,
} from '../../../../lib/dashboard.ts';
import { enumLabel } from '../../../../lib/labels.ts';
import { type Mod } from '../../../../types.ts';

export function ProjectModerationHeader({
  onOpenProject,
  project,
}: {
  onOpenProject: (mod: Mod) => void;
  project: DashboardProject;
}) {
  const mod = dashboardProjectToMod(project);
  const ownerName =
    project.owner === null || project.owner === undefined
      ? null
      : (project.owner.displayName ?? project.owner.username);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpenProject(mod)}
            className="text-left font-display text-lg font-extrabold text-ink transition-colors hover:text-accent"
          >
            {project.title}
          </button>
          {(ownerName || project.organization) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-muted">
              {project.owner && ownerName && (
                <a
                  href={userPath(project.owner.username)}
                  className="text-ink transition-colors hover:text-accent"
                >
                  {ownerName}
                </a>
              )}
              {project.owner && project.organization && (
                <span aria-hidden="true">·</span>
              )}
              {project.organization && (
                <a
                  href={organizationPath(project.organization.slug)}
                  className="text-ink transition-colors hover:text-accent"
                >
                  {project.organization.name}
                </a>
              )}
            </div>
          )}
          <p className="mt-1 text-sm leading-6 text-muted">{project.summary}</p>
        </div>
        <span className="shrink-0 rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted">
          {enumLabel(project.status)}
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
    </>
  );
}
