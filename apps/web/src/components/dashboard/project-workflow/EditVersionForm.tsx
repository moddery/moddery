import { type FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  fetchGameVersionTaxonomy,
  updateVersion,
  type DashboardData,
} from '../../../lib/dashboard.ts';
import { EditVersionFields } from './edit-version/EditVersionFields.tsx';
import { EditVersionSelectors } from './edit-version/EditVersionSelectors.tsx';
import { assertUpdateVersionInput } from './edit-version/update-version-input.ts';
import { useEditVersionFormState } from './edit-version/useEditVersionFormState.ts';

export function EditVersionForm({
  projects,
}: {
  projects: DashboardData['projects'];
}) {
  const form = useEditVersionFormState(projects);
  const gameVersionsQuery = useQuery({
    queryFn: ({ signal }) => fetchGameVersionTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-game-versions'],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  function selectProject(slug: string) {
    form.selectProject(slug);
    setError(null);
    setUpdated(null);
  }

  function selectVersion(version: (typeof form.versions)[number] | null) {
    form.selectVersion(version);
    setError(null);
    setUpdated(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = form.buildInput();
    if (input === null) return;
    setError(null);
    setUpdated(null);

    try {
      assertUpdateVersionInput(input);
      setSubmitting(true);
      const version = await updateVersion(input);
      setUpdated(`${version.name} ${version.versionNumber}`);
      await form.versionsQuery.refetch();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Version update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Edit a version
        </h2>
        <p className="text-sm leading-6 text-muted">
          Update release metadata, changelog, loaders, and game versions.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <EditVersionSelectors
          disabled={submitting}
          projectSlug={form.projectSlug}
          projects={projects}
          selectedVersion={form.selectedVersion}
          versions={form.versions}
          onProjectChange={selectProject}
          onVersionChange={selectVersion}
        />

        {form.versionsQuery.isLoading ? (
          <p className="py-2 text-sm font-semibold text-muted">
            Loading versions...
          </p>
        ) : form.selectedVersion === null ? (
          <p className="py-2 text-sm font-semibold text-muted">
            Publish a version before editing release metadata.
          </p>
        ) : (
          <EditVersionFields
            {...form.fields}
            disabled={submitting}
            gameVersionOptions={gameVersionsQuery.data ?? []}
          />
        )}

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
            disabled={submitting || form.selectedVersion === null}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editVersionButtonLabel(submitting)}
          </button>
        </div>
      </form>
    </section>
  );
}

export function editVersionButtonLabel(submitting: boolean) {
  return submitting ? 'Saving...' : 'Save version';
}
