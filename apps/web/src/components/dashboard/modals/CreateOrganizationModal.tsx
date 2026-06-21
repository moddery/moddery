import { useState } from 'react';

import {
  createOrganization,
  updateOrganization,
  uploadOwnerImage,
} from '../../../lib/dashboard.ts';
import { FileDropzone } from '../../ui/dashboard/FileDropzone.tsx';
import { MultiStepDialog, type WizardStep } from '../../ui/dashboard/index.ts';
import { DashboardField } from '../content-management/shared.tsx';
import {
  assertOrganizationInput,
  normalizeCreateOrganizationInput,
} from '../content-management/organization-input.ts';

interface OrgContext {
  color: string;
  description: string;
  iconFile: File | null;
  name: string;
  setColor: (value: string) => void;
  setDescription: (value: string) => void;
  setIconFile: (file: File | null) => void;
  setName: (value: string) => void;
  setSlug: (value: string) => void;
  slug: string;
}

export function CreateOrganizationModal({
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
  const [iconFile, setIconFile] = useState<File | null>(null);

  const context: OrgContext = {
    color,
    description,
    iconFile,
    name,
    setColor,
    setDescription,
    setIconFile,
    setName,
    setSlug,
    slug,
  };

  const steps: WizardStep<OrgContext>[] = [
    {
      id: 'details',
      title: 'Organization details',
      validate: (ctx) => validateOrganizationDetailsStep(ctx),
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
      title: 'Organization icon (optional)',
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
          <ReviewRow
            label="Icon"
            value={ctx.iconFile ? ctx.iconFile.name : 'None'}
          />
        </div>
      ),
    },
  ];

  async function complete(ctx: OrgContext) {
    const input = normalizeCreateOrganizationInput({
      color: ctx.color,
      description: ctx.description,
      iconUrl: '',
      name: ctx.name,
      slug: ctx.slug,
    });
    assertOrganizationInput(input);

    const created = await createOrganization(input);
    if (ctx.iconFile !== null) {
      const target = await uploadOwnerImage({
        file: ctx.iconFile,
        ownerId: created.id,
        ownerType: 'organization',
        uploadKind: 'organization-icon',
      });
      await updateOrganization({
        color: created.color,
        description: created.description,
        iconUrl: target.objectUrl,
        name: created.name,
        organizationId: created.id,
        slug: created.slug,
      });
    }

    setName('');
    setSlug('');
    setDescription('');
    setColor('#1d9bf0');
    setIconFile(null);
    await onCreated();
  }

  return (
    <MultiStepDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create an organization"
      description="Create a creator group for shared ownership and project grouping."
      submitLabel="Create organization"
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

export function validateOrganizationDetailsStep(fields: {
  name: string;
  slug: string;
}): string | null {
  if (fields.name.trim().length === 0) return 'Organization name is required';
  if (fields.slug.trim().length < 3) {
    return 'Organization slug must be at least 3 characters';
  }
  return null;
}
