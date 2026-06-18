import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { type DashboardData } from '../../../../lib/dashboard.ts';

export function DependencyVersionSelectors({
  projectSlug,
  projects,
  selectedVersion,
  versions,
  onProjectChange,
  onVersionChange,
}: {
  projectSlug: string;
  projects: DashboardData['projects'];
  selectedVersion: ProjectVersion | null;
  versions: ProjectVersion[];
  onProjectChange: (slug: string) => void;
  onVersionChange: (version: ProjectVersion | null) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="grid gap-1 text-sm font-bold text-ink">
        Project
        <select
          value={projectSlug}
          onChange={(event) => onProjectChange(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
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
          onChange={(event) => {
            onVersionChange(
              versions.find((version) => version.id === event.target.value) ??
                null,
            );
          }}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
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
    </div>
  );
}
