import { type FormEvent, useState } from 'react';

import {
  computeVersionFileHashes,
  createVersion,
  fetchGameVersionTaxonomy,
  type DashboardData,
  type DashboardVersion,
  uploadProjectFile,
} from '../../../lib/dashboard.ts';
import { useQuery } from '@tanstack/react-query';
import { PublishVersionFields } from './publish-version/PublishVersionFields.tsx';
import { assertCreateVersionInput } from './publish-version/publish-version-input.ts';
import { publishableVersionProjects } from './publish-version/publish-version-projects.ts';
import { usePublishVersionFormState } from './publish-version/usePublishVersionFormState.ts';
import {
  canPublishCreatorContent,
  creatorPublishingRequirementMessage,
} from './publishing-eligibility.ts';

export function PublishVersionForm({
  emailVerifiedAt,
  onCreated,
  projects,
}: {
  emailVerifiedAt: string | null;
  onCreated?: () => Promise<void>;
  projects: DashboardData['projects'];
}) {
  const publishableProjects = publishableVersionProjects(projects);
  const form = usePublishVersionFormState(publishableProjects);
  const canPublish = canPublishCreatorContent(emailVerifiedAt);
  const requirementMessage =
    creatorPublishingRequirementMessage(emailVerifiedAt);
  const gameVersionsQuery = useQuery({
    queryFn: ({ signal }) => fetchGameVersionTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-game-versions'],
  });
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<DashboardVersion | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPublish) {
      setError(requirementMessage);
      return;
    }

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
      assertCreateVersionInput(input);
      const version = await createVersion(input);
      setCreated(version);
      setLocalFile(null);
      form.reset();
      await onCreated?.();
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
          Add release metadata, upload a local file, or attach an existing file
          URL for a managed project.
        </p>
      </div>

      {publishableProjects.length === 0 ? (
        <p className="mt-4 rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
          Approved projects can publish versions. Create a project and wait for
          approval before adding release files.
        </p>
      ) : (
        <form
          onSubmit={(event) => void submit(event)}
          className="mt-4 grid gap-3"
        >
          <PublishVersionFields
            {...form.fields}
            disabled={submitting}
            gameVersionOptions={gameVersionsQuery.data ?? []}
            hasLocalFile={localFile !== null}
            onLocalFileChange={(file) => {
              setLocalFile(file);
              form.fields.onLocalFileChange(file);
            }}
          />

          {requirementMessage && (
            <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold leading-6 text-ink">
              {requirementMessage}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
              {error}
            </p>
          )}
          {created && (
            <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold leading-6 text-ink">
              Published {created.name} {created.versionNumber}.{' '}
              {versionCreationReviewMessage(created)}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={submitting || !canPublish}
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {publishVersionButtonLabel(submitting)}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export function versionCreationReviewMessage(
  version: Pick<DashboardVersion, 'status'>,
) {
  if (version.status === 'APPROVED') {
    return 'It is approved and visible on the project page.';
  }

  if (version.status === 'PENDING_REVIEW') {
    return 'It is queued for review before becoming public.';
  }

  return 'It is saved, but it is not public yet.';
}

export function publishVersionButtonLabel(submitting: boolean) {
  return submitting ? 'Publishing...' : 'Publish version';
}
