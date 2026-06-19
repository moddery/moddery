import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';

import { projectPath } from '../../../app/routing.ts';
import { fetchProjectAnalytics } from '../../../lib/catalog.ts';
import { type DashboardProject } from '../../../lib/dashboard.ts';
import { projectTypeFromKind } from '../../../lib/projectTypes.ts';
import { ProjectAnalyticsSummary } from './analytics/ProjectAnalyticsSummary.tsx';

export function ProjectAnalyticsPanel({
  projects,
}: {
  projects: DashboardProject[];
}) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  useEffect(() => {
    if (projects.length === 0) return;
    if (projects.some((project) => project.slug === projectSlug)) return;

    setProjectSlug(projects[0]?.slug ?? '');
  }, [projectSlug, projects]);

  const analyticsQuery = useQuery({
    enabled: projectSlug.length > 0,
    queryFn: ({ signal }) => fetchProjectAnalytics(projectSlug, signal),
    queryKey: ['dashboard', 'project-analytics', projectSlug],
  });
  const analytics = analyticsQuery.data ?? null;
  const selectedProject =
    projects.find((project) => project.slug === projectSlug) ?? projects[0];

  if (projects.length === 0) return null;

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Project analytics
          </h2>
          <p className="text-sm leading-6 text-muted">
            Track recent views and downloads for projects you manage.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-64">
          <label className="grid gap-1 text-sm font-bold text-ink">
            Project
            <select
              value={projectSlug}
              onChange={(event) => setProjectSlug(event.target.value)}
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
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
              href={projectAnalyticsHref(selectedProject)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-extrabold text-ink transition-colors hover:bg-control-hover"
            >
              <ExternalLink className="size-4 text-accent-icon" />
              Open project
            </a>
          )}
        </div>
      </div>

      {analyticsQuery.isLoading ? (
        <div className="mt-4 grid gap-3">
          <div className="h-20 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-36 animate-pulse rounded-lg bg-surface-2" />
        </div>
      ) : analyticsQuery.error ? (
        <p className="mt-4 text-sm font-semibold text-danger">
          Could not load analytics.
        </p>
      ) : analytics ? (
        <ProjectAnalyticsSummary analytics={analytics} />
      ) : (
        <p className="py-8 text-sm text-muted">No analytics found.</p>
      )}
    </section>
  );
}

export function projectAnalyticsHref(
  project: Pick<DashboardProject, 'kind' | 'slug'>,
) {
  return projectPath(projectTypeFromKind(project.kind), project.slug);
}
