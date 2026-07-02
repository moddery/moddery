import { type FormEvent, useState } from 'react';

import {
  updateVersionDependencies,
  type DashboardData,
} from '../../../lib/dashboard.ts';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';
import { DependencyFields } from './edit-version-dependencies/DependencyFields.tsx';
import { DependencyVersionSelectors } from './edit-version-dependencies/DependencyVersionSelectors.tsx';
import { useVersionDependencyFormState } from './edit-version-dependencies/useVersionDependencyFormState.ts';

export function EditVersionDependencyForm({
  defaultOpen = false,
  projects,
}: {
  defaultOpen?: boolean;
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
    <CollapsiblePanel
      defaultOpen={defaultOpen}
      title="Edit version dependency"
      description="Replace the dependency list for a version with project, version, or external file dependencies."
    >
      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <DependencyVersionSelectors
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
            Publish a version before editing dependencies.
          </p>
        ) : (
          <DependencyFields
            disabled={submitting}
            projects={projects}
            {...form.fields}
          />
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
            {editDependencyButtonLabel(submitting)}
          </button>
        </div>
      </form>
    </CollapsiblePanel>
  );
}

export function editDependencyButtonLabel(submitting: boolean) {
  return submitting ? 'Saving...' : 'Save dependencies';
}
