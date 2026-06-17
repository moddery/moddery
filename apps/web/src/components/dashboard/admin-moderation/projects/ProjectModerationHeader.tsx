import {
  dashboardProjectToMod,
  type DashboardProject,
} from '../../../../lib/dashboard.ts';
import { type Mod } from '../../../../types.ts';

export function ProjectModerationHeader({
  onOpenProject,
  project,
}: {
  onOpenProject: (mod: Mod) => void;
  project: DashboardProject;
}) {
  const mod = dashboardProjectToMod(project);

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
    </>
  );
}
