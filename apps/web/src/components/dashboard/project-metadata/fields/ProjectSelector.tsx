import { ExternalLink } from 'lucide-react';

import { projectPath } from '../../../../app/routing.ts';
import { type DashboardProject } from '../../../../lib/dashboard.ts';
import { projectTypeFromKind } from '../../../../lib/projectTypes.ts';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectSelector({
  disabled,
  onProjectChange,
  projectSlug,
  projects,
}: Pick<
  ProjectMetadataFieldsProps,
  'disabled' | 'onProjectChange' | 'projectSlug' | 'projects'
>) {
  const selectedProject = projects.find(
    (project) => project.slug === projectSlug,
  );

  return (
    <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <label className="grid gap-1 text-sm font-bold text-ink">
        Project
        <select
          disabled={disabled}
          value={projectSlug}
          onChange={(event) => onProjectChange(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {projects.map((project) => (
            <option key={project.slug} value={project.slug}>
              {project.title}
            </option>
          ))}
        </select>
      </label>
      {selectedProject && (
        <a
          href={projectSelectorHref(selectedProject)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-extrabold text-ink transition-colors hover:bg-control-hover"
        >
          <ExternalLink className="size-4 text-accent-icon" />
          Open project
        </a>
      )}
    </div>
  );
}

export function projectSelectorHref(
  project: Pick<DashboardProject, 'kind' | 'slug'>,
) {
  return projectPath(projectTypeFromKind(project.kind), project.slug);
}
