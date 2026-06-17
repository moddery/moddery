import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchModerationProjects,
  lockProjectForModeration,
  moderateProject,
  releaseProjectModerationLock,
} from '../../../lib/dashboard.ts';
import { type Mod } from '../../../types.ts';
import { ProjectModerationRow } from './projects/ProjectModerationRow.tsx';
import {
  ProjectModerationEmpty,
  ProjectModerationError,
  ProjectModerationSkeleton,
} from './projects/ProjectModerationStates.tsx';
import { nullableText } from './shared.tsx';

export function ProjectModerationQueue({
  onOpenProject,
}: {
  onOpenProject: (mod: Mod) => void;
}) {
  const [reason, setReason] = useState('');
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const projectsQuery = useQuery({
    queryFn: ({ signal }) => fetchModerationProjects(signal),
    queryKey: ['dashboard', 'moderation-projects'],
  });
  const projects = projectsQuery.data ?? [];

  async function act(projectSlug: string, action: string) {
    setBusySlug(projectSlug);
    setMessage(null);

    try {
      await moderateProject({
        action,
        projectSlug,
        reason: nullableText(reason),
      });
      await projectsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Project moderation failed',
      );
    } finally {
      setBusySlug(null);
    }
  }

  async function updateLock(projectSlug: string, action: 'lock' | 'release') {
    setBusySlug(projectSlug);
    setMessage(null);

    try {
      if (action === 'lock') {
        await lockProjectForModeration(projectSlug);
      } else {
        await releaseProjectModerationLock(projectSlug);
      }
      await projectsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Project lock update failed',
      );
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Project review
        </h2>
        <span className="text-sm font-semibold text-muted">
          {projects.length.toLocaleString('en-US')} queued
        </span>
      </div>

      <label className="mt-4 grid gap-1 text-sm font-bold text-ink">
        Reason
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          placeholder="Optional moderation note"
        />
      </label>

      {projectsQuery.isLoading ? (
        <ProjectModerationSkeleton />
      ) : projectsQuery.error ? (
        <ProjectModerationError
          message={
            projectsQuery.error instanceof Error
              ? projectsQuery.error.message
              : 'Project review queue failed to load'
          }
        />
      ) : projects.length === 0 ? (
        <ProjectModerationEmpty />
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectModerationRow
              busy={busySlug === project.slug}
              key={project.slug}
              onAction={act}
              onLock={(projectSlug) => updateLock(projectSlug, 'lock')}
              onReleaseLock={(projectSlug) =>
                updateLock(projectSlug, 'release')
              }
              onOpenProject={onOpenProject}
              project={project}
            />
          ))}
        </div>
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {message}
        </p>
      )}
    </section>
  );
}
