import { type FormEvent, useState } from 'react';

import {
  updateVersionDependencies,
  type DashboardData,
} from '../../../lib/dashboard.ts';
import { DependencyFields } from './edit-version-dependencies/DependencyFields.tsx';
import { DependencyVersionSelectors } from './edit-version-dependencies/DependencyVersionSelectors.tsx';
import { useVersionDependencyFormState } from './edit-version-dependencies/useVersionDependencyFormState.ts';

export function EditVersionDependencyForm({
  projects,
}: {
  projects: DashboardData['projects'];
}) {
  const form = useVersionDependencyFormState(projects);
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
    setSubmitting(true);
    setError(null);
    setUpdated(null);

    try {
      const version = await updateVersionDependencies(input);
      setUpdated(`${version.name} ${version.versionNumber}`);
      await form.versionsQuery.refetch();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Dependency update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Edit version dependency
        </h2>
        <p className="text-sm leading-6 text-muted">
          Replace the dependency list for a version with a project, version, or
          external file dependency.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <DependencyVersionSelectors
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
            Publish a version before editing dependencies.
          </p>
        ) : (
          <DependencyFields {...form.fields} />
        )}

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {updated && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            Updated dependencies for {updated}.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting || form.selectedVersion === null}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save dependencies'}
          </button>
        </div>
      </form>
    </section>
  );
}
