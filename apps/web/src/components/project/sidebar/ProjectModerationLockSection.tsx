import { LockKeyhole } from 'lucide-react';

import { type ProjectDetails } from '../../../lib/catalog.ts';
import { userPath } from '../../../app/routing.ts';
import { projectModerationLockExpiry } from './project-moderation-lock.ts';

export function ProjectModerationLockSection({
  project,
}: {
  project: ProjectDetails;
}) {
  if (project.moderationLock === null) return null;

  const moderator =
    project.moderationLock.moderator.displayName ??
    project.moderationLock.moderator.username;

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Review lock
      </h2>
      <p className="mt-3 rounded-lg border border-line bg-surface px-3 py-3 text-sm font-semibold text-muted">
        <span className="flex items-start gap-2">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-accent-icon" />
          <span>
            Locked by{' '}
            <a
              href={userPath(project.moderationLock.moderator.username)}
              className="font-bold text-ink transition-colors hover:text-accent"
            >
              {moderator}
            </a>{' '}
            until {projectModerationLockExpiry(project.moderationLock)}
          </span>
        </span>
      </p>
    </section>
  );
}
