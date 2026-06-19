import { ExternalLink } from 'lucide-react';

import {
  type DashboardData,
  type DashboardVersion,
} from '../../../../lib/dashboard.ts';
import {
  workflowProjectHref,
  workflowVersionHref,
} from '../version-route-links.ts';

export function EditVersionSelectors({
  disabled,
  projectSlug,
  projects,
  selectedVersion,
  versions,
  onProjectChange,
  onVersionChange,
}: {
  disabled?: boolean;
  projectSlug: string;
  projects: DashboardData['projects'];
  selectedVersion: DashboardVersion | null;
  versions: DashboardVersion[];
  onProjectChange: (slug: string) => void;
  onVersionChange: (version: DashboardVersion | null) => void;
}) {
  const selectedProject =
    projects.find((project) => project.slug === projectSlug) ?? null;

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
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
      <label className="grid gap-1 text-sm font-bold text-ink">
        Version
        <select
          disabled={disabled}
          value={selectedVersion?.id ?? ''}
          onChange={(event) => {
            onVersionChange(
              versions.find((version) => version.id === event.target.value) ??
                null,
            );
          }}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {versions.length === 0 ? (
            <option value="">No versions</option>
          ) : (
            versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.name} {version.versionNumber}
              </option>
            ))
          )}
        </select>
      </label>
      {selectedProject ? (
        <div className="flex flex-wrap gap-2">
          <a
            href={workflowProjectHref(selectedProject)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Open project
          </a>
          {selectedVersion ? (
            <a
              href={workflowVersionHref(selectedProject, selectedVersion)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open version
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
