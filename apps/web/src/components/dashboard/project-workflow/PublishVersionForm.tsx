import { type FormEvent, useState } from 'react';

import {
  computeVersionFileHashes,
  createVersion,
  type DashboardData,
  uploadProjectFile,
} from '../../../lib/dashboard.ts';
import { PublishVersionFields } from './publish-version/PublishVersionFields.tsx';
import { usePublishVersionFormState } from './publish-version/usePublishVersionFormState.ts';

export function PublishVersionForm({
  projects,
}: {
  projects: DashboardData['projects'];
}) {
  const form = usePublishVersionFormState(projects);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreated(null);

    try {
      const input = form.buildInput();
      if (localFile !== null) {
        const versionFile = input.files[0];
        const hashes = await computeVersionFileHashes(localFile);
        const target = await uploadProjectFile({
          file: localFile,
          projectSlug: input.projectSlug,
          uploadKind: 'version-file',
        });
        input.files[0] = {
          fileName: localFile.name,
          hashes,
          primary: versionFile?.primary ?? true,
          sizeBytes: localFile.size,
          url: target.objectUrl,
        };
      }
      const version = await createVersion(input);
      setCreated(`${version.name} ${version.versionNumber}`);
      setLocalFile(null);
      form.reset();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Version creation failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Publish a version
        </h2>
        <p className="text-sm leading-6 text-muted">
          Add release metadata and an externally hosted file URL for a managed
          project.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <PublishVersionFields
          {...form.fields}
          hasLocalFile={localFile !== null}
          onLocalFileChange={(file) => {
            setLocalFile(file);
            form.fields.onLocalFileChange(file);
          }}
        />

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {created && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            Published {created}.
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Publishing...' : 'Publish version'}
          </button>
        </div>
      </form>
    </section>
  );
}
