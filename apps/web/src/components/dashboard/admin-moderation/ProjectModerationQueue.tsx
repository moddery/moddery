import { type Mod } from '../../../types.ts';
import { Pagination } from '../../Pagination.tsx';
import { ProjectModerationRow } from './projects/ProjectModerationRow.tsx';
import {
  ProjectModerationEmpty,
  ProjectModerationError,
  ProjectModerationSkeleton,
} from './projects/ProjectModerationStates.tsx';
import { useProjectModerationQueueState } from './projects/useProjectModerationQueueState.ts';

export function ProjectModerationQueue({
  onOpenProject,
}: {
  onOpenProject: (mod: Mod) => void;
}) {
  const queue = useProjectModerationQueueState();

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Project review
        </h2>
        <span className="text-sm font-semibold text-muted">
          {queue.totalHits.toLocaleString('en-US')} queued
        </span>
      </div>

      <label className="mt-4 grid gap-1 text-sm font-bold text-ink">
        Reason
        <input
          value={queue.reason}
          onChange={(event) => queue.setReason(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          placeholder="Optional moderation note"
        />
      </label>

      {queue.projectsQuery.isLoading ? (
        <ProjectModerationSkeleton />
      ) : queue.projectsQuery.error ? (
        <ProjectModerationError
          message={
            queue.projectsQuery.error instanceof Error
              ? queue.projectsQuery.error.message
              : 'Project review queue failed to load'
          }
        />
      ) : queue.projects.length === 0 ? (
        <ProjectModerationEmpty />
      ) : (
        <div className="mt-4">
          {queue.totalPages > 1 && (
            <div className="mb-3 flex justify-end">
              <Pagination
                page={queue.page}
                totalPages={queue.totalPages}
                onPage={queue.setPage}
              />
            </div>
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            {queue.projects.map((project) => (
              <ProjectModerationRow
                busy={queue.busySlug === project.slug}
                key={project.slug}
                onAction={queue.act}
                onLock={(projectSlug) => queue.updateLock(projectSlug, 'lock')}
                onReleaseLock={(projectSlug) =>
                  queue.updateLock(projectSlug, 'release')
                }
                onOpenProject={onOpenProject}
                project={project}
              />
            ))}
          </div>
          {queue.totalPages > 1 && (
            <div className="mt-3 flex justify-end">
              <Pagination
                page={queue.page}
                totalPages={queue.totalPages}
                onPage={queue.setPage}
              />
            </div>
          )}
        </div>
      )}

      {queue.message && (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {queue.message}
        </p>
      )}
    </section>
  );
}
