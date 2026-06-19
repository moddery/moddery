import { type FormEvent, useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { type DashboardData } from '../../../../lib/dashboard.ts';
import { relationProjectHref } from './relation-route-links.ts';

export type ProjectRelationAction = {
  idleLabel: string;
  pendingLabel: string;
  run: (containerId: string, projectSlug: string) => Promise<unknown>;
};

export type ProjectRelationContainer = {
  id: string;
  name: string;
};

export type ProjectRelationLink = {
  href: string;
  label: string;
};

interface ProjectRelationOperationFormProps {
  action: ProjectRelationAction;
  containerLabel: string;
  containers: ProjectRelationContainer[];
  failureLabel: string;
  getContainerLink?: (containerId: string) => ProjectRelationLink | null;
  onChanged: () => Promise<void>;
  projects: DashboardData['projects'];
}

export function ProjectRelationOperationForm({
  action,
  containerLabel,
  containers,
  failureLabel,
  getContainerLink,
  onChanged,
  projects,
}: ProjectRelationOperationFormProps) {
  const [containerId, setContainerId] = useState(containers[0]?.id ?? '');
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedProject =
    projects.find((project) => project.slug === projectSlug) ?? null;
  const containerLink = getContainerLink?.(containerId) ?? null;
  const projectLink =
    selectedProject === null
      ? null
      : {
          href: relationProjectHref(selectedProject),
          label: 'Open project',
        };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await action.run(containerId, projectSlug);
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : failureLabel);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-5 grid gap-3 border-t border-line pt-5"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <label className="grid gap-1 text-sm font-bold text-ink">
          {containerLabel}
          <select
            value={containerId}
            onChange={(event) => setContainerId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {containers.map((container) => (
              <option key={container.id} value={container.id}>
                {container.name}
              </option>
            ))}
          </select>
        </label>
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
        <div className="flex flex-wrap gap-2">
          {containerLink ? <RelationLinkButton link={containerLink} /> : null}
          {projectLink ? <RelationLinkButton link={projectLink} /> : null}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? action.pendingLabel : action.idleLabel}
        </button>
      </div>
    </form>
  );
}

function RelationLinkButton({ link }: { link: ProjectRelationLink }) {
  return (
    <a
      href={link.href}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control"
    >
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
      {link.label}
    </a>
  );
}
