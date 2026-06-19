import { type FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  createProject,
  fetchCategoryTaxonomy,
  fetchGameVersionTaxonomy,
  type DashboardProject,
  updateProject,
  uploadProjectFile,
} from '../../../lib/dashboard.ts';
import { PublishProjectFields } from './publish-project/PublishProjectFields.tsx';
import { assertCreateProjectInput } from './publish-project/publish-project-input.ts';
import { usePublishProjectFormState } from './publish-project/usePublishProjectFormState.ts';

export function PublishProjectForm({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const form = usePublishProjectFormState();
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => fetchCategoryTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-categories'],
  });
  const gameVersionsQuery = useQuery({
    queryFn: ({ signal }) => fetchGameVersionTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-game-versions'],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<DashboardProject | null>(null);
  const [localIconFile, setLocalIconFile] = useState<File | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreated(null);

    try {
      const input = form.buildInput();
      assertCreateProjectInput(input);

      let createdProject = await createProject(input);
      if (localIconFile !== null) {
        const target = await uploadProjectFile({
          file: localIconFile,
          projectSlug: createdProject.slug,
          uploadKind: 'project-icon',
        });
        createdProject = await updateProject({
          iconUrl: target.objectUrl,
          projectSlug: createdProject.slug,
        });
      }
      form.reset();
      setLocalIconFile(null);
      setCreated(createdProject);
      await onCreated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Project creation failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Publish a project
        </h2>
        <p className="text-sm leading-6 text-muted">
          Create a catalog entry with the core metadata needed for review and
          discovery.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <PublishProjectFields
          {...form.fields}
          categoryOptions={categoriesQuery.data ?? []}
          gameVersionOptions={gameVersionsQuery.data ?? []}
          onIconFileChange={setLocalIconFile}
        />

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {created && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold leading-6 text-ink">
            Created {created.title}. {projectCreationReviewMessage(created)}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Publishing...' : 'Publish project'}
          </button>
        </div>
      </form>
    </section>
  );
}

export function projectCreationReviewMessage(
  project: Pick<DashboardProject, 'status'>,
) {
  return project.status === 'APPROVED'
    ? 'It is approved and ready for releases.'
    : 'It is queued for review before releases can be published.';
}
