import { type CollectionVisibility } from '@moddery/shared';
import { useState } from 'react';

import {
  createCollection,
  updateCollection,
  uploadOwnerImage,
} from '../../../lib/dashboard.ts';
import { FileDropzone } from '../../ui/dashboard/FileDropzone.tsx';
import { MultiStepDialog, type WizardStep } from '../../ui/dashboard/index.ts';
import { DashboardField } from '../content-management/shared.tsx';
import {
  assertCollectionInput,
  normalizeCreateCollectionInput,
} from '../content-management/collection-input.ts';

interface CollectionContext {
  color: string;
  description: string;
  iconFile: File | null;
  name: string;
  setColor: (value: string) => void;
  setDescription: (value: string) => void;
  setIconFile: (file: File | null) => void;
  setName: (value: string) => void;
  setSlug: (value: string) => void;
  setVisibility: (value: CollectionVisibility) => void;
  slug: string;
  visibility: CollectionVisibility;
}

export function CreateCollectionModal({
  onCreated,
  onOpenChange,
  open,
}: {
  onCreated: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1d9bf0');
  const [visibility, setVisibility] = useState<CollectionVisibility>('PRIVATE');
  const [iconFile, setIconFile] = useState<File | null>(null);

  const context: CollectionContext = {
    color,
    description,
    iconFile,
    name,
    setColor,
    setDescription,
    setIconFile,
    setName,
    setSlug,
    setVisibility,
    slug,
    visibility,
  };

  const steps: WizardStep<CollectionContext>[] = [
    {
      id: 'details',
      title: 'Collection details',
      validate: (ctx) => validateCollectionDetailsStep(ctx),
      render: (ctx) => (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardField
              label="Name"
              value={ctx.name}
              onChange={ctx.setName}
              required
            />
            <DashboardField
              label="Slug"
              value={ctx.slug}
              onChange={ctx.setSlug}
              required
            />
          </div>
          <label className="grid gap-1 text-sm font-bold text-ink">
            Visibility
            <select
              value={ctx.visibility}
              onChange={(event) =>
                ctx.setVisibility(event.target.value as CollectionVisibility)
              }
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
            >
              <option value="PRIVATE">Private</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PUBLIC">Public</option>
            </select>
          </label>
          <DashboardField
            label="Description"
            value={ctx.description}
            onChange={ctx.setDescription}
          />
          <DashboardField
            label="Color"
            value={ctx.color}
            onChange={ctx.setColor}
          />
        </div>
      ),
    },
    {
      id: 'icon',
      title: 'Collection icon (optional)',
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
      title: 'Review & create',
      render: (ctx) => (
        <div className="grid gap-2 text-sm text-muted">
          <ReviewRow label="Name" value={ctx.name} />
          <ReviewRow label="Slug" value={ctx.slug} />
          <ReviewRow label="Visibility" value={ctx.visibility} />
          <ReviewRow
            label="Icon"
            value={ctx.iconFile ? ctx.iconFile.name : 'None'}
          />
        </div>
      ),
    },
  ];

  async function complete(ctx: CollectionContext) {
    const input = normalizeCreateCollectionInput({
      color: ctx.color,
      description: ctx.description,
      iconUrl: '',
      name: ctx.name,
      slug: ctx.slug,
      visibility: ctx.visibility,
    });
    assertCollectionInput(input);

    const created = await createCollection(input);
    if (ctx.iconFile !== null) {
      const target = await uploadOwnerImage({
        file: ctx.iconFile,
        ownerId: created.id,
        ownerType: 'collection',
        uploadKind: 'collection-icon',
      });
      await updateCollection({
        collectionId: created.id,
        color: created.color,
        description: created.description,
        iconUrl: target.objectUrl,
        name: created.name,
        slug: created.slug,
        visibility: created.visibility,
      });
    }

    setName('');
    setSlug('');
    setDescription('');
    setColor('#1d9bf0');
    setVisibility('PRIVATE');
    setIconFile(null);
    await onCreated();
  }

  return (
    <MultiStepDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create a collection"
      description="Group projects into a curated, shareable list."
      submitLabel="Create collection"
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

export function validateCollectionDetailsStep(fields: {
  name: string;
  slug: string;
}): string | null {
  if (fields.name.trim().length === 0) return 'Collection name is required';
  if (fields.slug.trim().length < 3) {
    return 'Collection slug must be at least 3 characters';
  }
  return null;
}
