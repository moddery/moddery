import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  createProject,
  fetchCategoryTaxonomy,
  fetchGameVersionTaxonomy,
  updateProject,
  uploadProjectFile,
} from '../../../lib/dashboard.ts';
import { MultiStepDialog, type WizardStep } from '../../ui/dashboard/index.ts';
import { DashboardField } from '../project-workflow/shared.tsx';
import { FileDropzone } from '../../ui/dashboard/FileDropzone.tsx';
import { assertCreateProjectInput } from '../project-workflow/publish-project/publish-project-input.ts';
import { PublishProjectTaxonomyFields } from '../project-workflow/publish-project/PublishProjectTaxonomyFields.tsx';
import { usePublishProjectFormState } from '../project-workflow/publish-project/usePublishProjectFormState.ts';
import {
  canPublishCreatorContent,
  creatorPublishingRequirementMessage,
} from '../project-workflow/publishing-eligibility.ts';

interface ProjectModalContext {
  fields: ReturnType<typeof usePublishProjectFormState>['fields'];
  categoryOptions: ReturnType<typeof useProjectTaxonomy>['categoryOptions'];
  gameVersionOptions: ReturnType<
    typeof useProjectTaxonomy
  >['gameVersionOptions'];
  iconFile: File | null;
  setIconFile: (file: File | null) => void;
}

function useProjectTaxonomy() {
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => fetchCategoryTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-categories'],
  });
  const gameVersionsQuery = useQuery({
    queryFn: ({ signal }) => fetchGameVersionTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-game-versions'],
  });

  return {
    categoryOptions: categoriesQuery.data ?? [],
    gameVersionOptions: gameVersionsQuery.data ?? [],
  };
}

export function CreateProjectModal({
  emailVerifiedAt,
  onCreated,
  onOpenChange,
  open,
}: {
  emailVerifiedAt: string | null;
  onCreated: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const form = usePublishProjectFormState();
  const { categoryOptions, gameVersionOptions } = useProjectTaxonomy();
  const [iconFile, setIconFile] = useState<File | null>(null);
  const requirementMessage =
    creatorPublishingRequirementMessage(emailVerifiedAt);

  const context: ProjectModalContext = {
    categoryOptions,
    fields: form.fields,
    gameVersionOptions,
    iconFile,
    setIconFile,
  };

  const steps: WizardStep<ProjectModalContext>[] = [
    {
      id: 'identity',
      title: 'Project identity',
      validate: (ctx) => validateProjectIdentityStep(ctx.fields),
      render: (ctx) => (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardField
              label="Title"
              value={ctx.fields.title}
              onChange={ctx.fields.onTitleChange}
              required
            />
            <DashboardField
              label="Slug"
              value={ctx.fields.slug}
              onChange={ctx.fields.onSlugChange}
              required
            />
          </div>
          <DashboardField
            label="Summary"
            value={ctx.fields.summary}
            onChange={ctx.fields.onSummaryChange}
            required
          />
          <label className="grid gap-1 text-sm font-bold text-ink">
            Description
            <textarea
              value={ctx.fields.description}
              onChange={(event) =>
                ctx.fields.onDescriptionChange(event.target.value)
              }
              className="min-h-28 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
            />
          </label>
          <DashboardField
            label="Color"
            value={ctx.fields.color}
            onChange={ctx.fields.onColorChange}
          />
        </div>
      ),
    },
    {
      id: 'taxonomy',
      title: 'Type & tags',
      render: (ctx) => (
        <PublishProjectTaxonomyFields
          categories={ctx.fields.categories}
          categoryOptions={ctx.categoryOptions}
          gameVersionOptions={ctx.gameVersionOptions}
          gameVersions={ctx.fields.gameVersions}
          kind={ctx.fields.kind}
          loaders={ctx.fields.loaders}
          onCategoriesChange={ctx.fields.onCategoriesChange}
          onGameVersionsChange={ctx.fields.onGameVersionsChange}
          onKindChange={ctx.fields.onKindChange}
          onLoadersChange={ctx.fields.onLoadersChange}
        />
      ),
    },
    {
      id: 'icon',
      title: 'Project icon (optional)',
      render: (ctx) => (
        <FileDropzone
          accept="image/png,image/jpeg,image/gif,image/webp"
          file={ctx.iconFile}
          label="Icon"
          onFileChange={ctx.setIconFile}
        />
      ),
    },
    {
      id: 'review',
      title: 'Review & publish',
      render: (ctx) => (
        <div className="grid gap-2 text-sm text-muted">
          <ReviewRow label="Title" value={ctx.fields.title} />
          <ReviewRow label="Slug" value={ctx.fields.slug} />
          <ReviewRow label="Type" value={ctx.fields.kind} />
          <ReviewRow
            label="Icon"
            value={ctx.iconFile ? ctx.iconFile.name : 'None'}
          />
          {requirementMessage && (
            <p className="mt-2 rounded-lg bg-control px-3 py-2 font-bold leading-6 text-ink">
              {requirementMessage}
            </p>
          )}
        </div>
      ),
    },
  ];

  async function complete(ctx: ProjectModalContext) {
    if (!canPublishCreatorContent(emailVerifiedAt)) {
      throw new Error(
        requirementMessage ?? 'Verify your email before publishing.',
      );
    }

    const input = form.buildInput();
    assertCreateProjectInput(input);

    let created = await createProject(input);
    if (ctx.iconFile !== null) {
      const target = await uploadProjectFile({
        file: ctx.iconFile,
        projectSlug: created.slug,
        uploadKind: 'project-icon',
      });
      created = await updateProject({
        iconUrl: target.objectUrl,
        projectSlug: created.slug,
      });
    }

    form.reset();
    setIconFile(null);
    await onCreated();
  }

  return (
    <MultiStepDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Publish a project"
      description="Create a catalog entry with the metadata needed for review and discovery."
      submitLabel="Publish project"
      steps={steps}
      context={context}
      onComplete={complete}
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

export function validateProjectIdentityStep(fields: {
  slug: string;
  summary: string;
  title: string;
}): string | null {
  if (fields.title.trim().length === 0) return 'Project title is required';
  if (fields.slug.trim().length < 3) {
    return 'Project slug must be at least 3 characters';
  }
  if (fields.summary.trim().length === 0) return 'Project summary is required';
  return null;
}
