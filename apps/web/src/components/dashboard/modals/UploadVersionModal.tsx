import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  computeVersionFileHashes,
  createVersion,
  fetchGameVersionTaxonomy,
  type DashboardData,
  uploadProjectFile,
} from '../../../lib/dashboard.ts';
import { FileDropzone } from '../../ui/dashboard/FileDropzone.tsx';
import {
  MultiStepDialog,
  PanelEmptyState,
  type WizardStep,
} from '../../ui/dashboard/index.ts';
import { assertCreateVersionInput } from '../project-workflow/publish-version/publish-version-input.ts';
import { publishableVersionProjects } from '../project-workflow/publish-version/publish-version-projects.ts';
import { PublishVersionChangelogField } from '../project-workflow/publish-version/PublishVersionChangelogField.tsx';
import { PublishVersionMetadataFields } from '../project-workflow/publish-version/PublishVersionMetadataFields.tsx';
import { usePublishVersionFormState } from '../project-workflow/publish-version/usePublishVersionFormState.ts';
import {
  canPublishCreatorContent,
  creatorPublishingRequirementMessage,
} from '../project-workflow/publishing-eligibility.ts';

export function UploadVersionModal({
  emailVerifiedAt,
  onCreated,
  onOpenChange,
  open,
  projects,
}: {
  emailVerifiedAt: string | null;
  onCreated: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  projects: DashboardData['projects'];
}) {
  const publishableProjects = publishableVersionProjects(projects);
  const form = usePublishVersionFormState(publishableProjects);
  const [file, setFile] = useState<File | null>(null);
  const requirementMessage =
    creatorPublishingRequirementMessage(emailVerifiedAt);
  const gameVersionsQuery = useQuery({
    queryFn: ({ signal }) => fetchGameVersionTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-game-versions'],
  });
  const gameVersionOptions = gameVersionsQuery.data ?? [];

  const context = { fields: form.fields, file, setFile };

  const steps: WizardStep<typeof context>[] = [
    {
      id: 'metadata',
      title: 'Release details',
      validate: (ctx) => validateVersionMetadataStep(ctx.fields),
      render: (ctx) => (
        <PublishVersionMetadataFields
          channel={ctx.fields.channel}
          gameVersionOptions={gameVersionOptions}
          gameVersions={ctx.fields.gameVersions}
          loaders={ctx.fields.loaders}
          name={ctx.fields.name}
          projectSlug={ctx.fields.projectSlug}
          projects={ctx.fields.projects}
          versionNumber={ctx.fields.versionNumber}
          onChannelChange={ctx.fields.onChannelChange}
          onGameVersionsChange={ctx.fields.onGameVersionsChange}
          onLoadersChange={ctx.fields.onLoadersChange}
          onNameChange={ctx.fields.onNameChange}
          onProjectSlugChange={ctx.fields.onProjectSlugChange}
          onVersionNumberChange={ctx.fields.onVersionNumberChange}
        />
      ),
    },
    {
      id: 'file',
      title: 'Release file',
      validate: (ctx) =>
        ctx.file === null ? 'Select a release file to upload' : null,
      render: (ctx) => (
        <FileDropzone
          accept=".jar,.mrpack,.zip"
          file={ctx.file}
          label="Release file (JAR, MRPACK, or ZIP)"
          previewKind="file"
          onFileChange={ctx.setFile}
        />
      ),
    },
    {
      id: 'changelog',
      title: 'Changelog (optional)',
      render: (ctx) => (
        <PublishVersionChangelogField
          changelog={ctx.fields.changelog}
          onChangelogChange={ctx.fields.onChangelogChange}
        />
      ),
    },
    {
      id: 'review',
      title: 'Review & publish',
      render: (ctx) => (
        <div className="grid gap-2 text-sm text-muted">
          <ReviewRow label="Project" value={ctx.fields.projectSlug} />
          <ReviewRow label="Version" value={ctx.fields.versionNumber} />
          <ReviewRow label="Channel" value={ctx.fields.channel} />
          <ReviewRow label="File" value={ctx.file ? ctx.file.name : 'None'} />
          {requirementMessage && (
            <p className="mt-2 rounded-lg bg-control px-3 py-2 font-bold leading-6 text-ink">
              {requirementMessage}
            </p>
          )}
        </div>
      ),
    },
  ];

  async function complete(ctx: typeof context) {
    if (!canPublishCreatorContent(emailVerifiedAt)) {
      throw new Error(
        requirementMessage ?? 'Verify your email before publishing.',
      );
    }
    if (ctx.file === null) {
      throw new Error('Select a release file to upload');
    }

    const input = form.buildInput();
    const localFile = ctx.file;
    const primary = input.files[0]?.primary ?? true;
    input.files[0] = {
      fileName: localFile.name,
      hashes: [],
      primary,
      sizeBytes: localFile.size,
      url: '',
    };
    assertCreateVersionInput(input, { allowMissingFileUrl: true });

    const hashes = await computeVersionFileHashes(localFile);
    const target = await uploadProjectFile({
      file: localFile,
      projectSlug: input.projectSlug,
      uploadKind: 'version-file',
    });
    input.files[0] = {
      fileName: localFile.name,
      hashes,
      primary,
      sizeBytes: localFile.size,
      url: target.objectUrl,
    };
    assertCreateVersionInput(input);

    await createVersion(input);
    form.reset();
    setFile(null);
    await onCreated();
  }

  return (
    <MultiStepDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Publish a version"
      description="Upload a release file and metadata for one of your approved projects."
      submitLabel="Publish version"
      steps={
        publishableProjects.length === 0
          ? [
              {
                id: 'empty',
                title: 'No approved projects',
                render: () => (
                  <PanelEmptyState
                    title="Approved projects can publish versions"
                    body="Create a project and wait for approval before adding release files."
                  />
                ),
              },
            ]
          : steps
      }
      context={context}
      onComplete={
        publishableProjects.length === 0
          ? async () => onOpenChange(false)
          : complete
      }
    />
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/60 pb-1">
      <span className="font-bold text-faint">{label}</span>
      <span className="truncate font-semibold text-ink">{value || '—'}</span>
    </div>
  );
}

export function validateVersionMetadataStep(fields: {
  name: string;
  projectSlug: string;
  versionNumber: string;
}): string | null {
  if (fields.projectSlug.trim().length === 0) return 'Select a project';
  if (fields.name.trim().length === 0) return 'Version name is required';
  if (fields.versionNumber.trim().length === 0) {
    return 'Version number is required';
  }
  return null;
}
