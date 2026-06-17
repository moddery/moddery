import { type FormEvent, useState } from 'react';

import { updateProject, type DashboardProject } from '../../lib/dashboard.ts';
import { ProjectMetadataFields } from './project-metadata/ProjectMetadataFields.tsx';
import { useProjectMetadataFormState } from './project-metadata/useProjectMetadataFormState.ts';

export function ProjectMetadataForm({
  onUpdated,
  projects,
}: {
  onUpdated: () => Promise<void>;
  projects: DashboardProject[];
}) {
  const metadataForm = useProjectMetadataFormState(projects);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  function selectProject(slug: string) {
    metadataForm.selectProject(slug);
    setError(null);
    setUpdated(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setUpdated(null);

    try {
      const project = await updateProject(metadataForm.buildInput());
      setUpdated(project.title);
      await onUpdated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Project update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Edit project metadata
        </h2>
        <p className="text-sm leading-6 text-muted">
          Update project copy, icons, links, and discovery tags.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <ProjectMetadataFields
          {...metadataForm.fields}
          onProjectChange={selectProject}
        />

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {updated && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            Updated {updated}.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save project'}
          </button>
        </div>
      </form>
    </section>
  );
}
