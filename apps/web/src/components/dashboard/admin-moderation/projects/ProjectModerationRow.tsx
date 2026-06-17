import { type DashboardProject } from '../../../../lib/dashboard.ts';
import { type Mod } from '../../../../types.ts';
import { ProjectModerationActions } from './ProjectModerationActions.tsx';
import { ProjectModerationHeader } from './ProjectModerationHeader.tsx';
import {
  ProjectLifecycle,
  ProjectModerationLock,
} from './ProjectModerationLifecycle.tsx';

export function ProjectModerationRow({
  busy,
  onAction,
  onLock,
  onOpenProject,
  onReleaseLock,
  project,
}: {
  busy: boolean;
  onAction: (projectSlug: string, action: string) => Promise<void>;
  onLock: (projectSlug: string) => Promise<void>;
  onOpenProject: (mod: Mod) => void;
  onReleaseLock: (projectSlug: string) => Promise<void>;
  project: DashboardProject;
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <ProjectModerationHeader
        project={project}
        onOpenProject={onOpenProject}
      />
      <ProjectModerationLock project={project} />
      <ProjectLifecycle project={project} />
      <ProjectModerationActions
        busy={busy}
        project={project}
        onAction={onAction}
        onLock={onLock}
        onReleaseLock={onReleaseLock}
      />
    </article>
  );
}
