import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchProjectAnalytics } from '../../../lib/catalog.ts';
import { type DashboardProject } from '../../../lib/dashboard.ts';
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
        <label className="grid gap-1 text-sm font-bold text-ink sm:min-w-64">
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
