import { type FormEvent, useState } from 'react';

import {
  createOrganization,
  type CreateOrganizationInput,
  type DashboardData,
  type DashboardOrganization,
} from '../../../lib/dashboard.ts';
import { DashboardField } from './shared.tsx';
import { EditOrganizationForm } from './EditOrganizationForm.tsx';
import { OrganizationProjectForms } from './OrganizationProjectForms.tsx';
import {
  assertOrganizationInput,
  normalizeCreateOrganizationInput,
} from './organization-input.ts';

export function CreateOrganizationForm({
  onCreated,
  organizations,
  projects,
}: {
  onCreated: () => Promise<void>;
  organizations: DashboardOrganization[];
  projects: DashboardData['projects'];
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [color, setColor] = useState('#1d9bf0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: CreateOrganizationInput = normalizeCreateOrganizationInput({
      color,
      description,
      iconUrl,
      name,
      slug,
    });

    try {
      assertOrganizationInput(input);
      await createOrganization(input);
      setName('');
      setSlug('');
      setDescription('');
      setIconUrl('');
      setColor('#1d9bf0');
      await onCreated();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Organization creation failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Create an organization
        </h2>
        <p className="text-sm leading-6 text-muted">
          Create a creator group for shared ownership and project grouping.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <DashboardField
            disabled={submitting}
            label="Name"
            value={name}
            onChange={setName}
            required
          />
          <DashboardField
            disabled={submitting}
            label="Slug"
            value={slug}
            onChange={setSlug}
            required
          />
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
          <DashboardField
            disabled={submitting}
            label="Description"
            value={description}
            onChange={setDescription}
          />
          <DashboardField
            disabled={submitting}
            label="Icon URL"
            value={iconUrl}
            onChange={setIconUrl}
          />
          <DashboardField
            disabled={submitting}
            label="Color"
            value={color}
            onChange={setColor}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createOrganizationButtonLabel(submitting)}
          </button>
        </div>
      </form>

      {organizations.length > 0 && (
        <EditOrganizationForm
          organizations={organizations}
          onUpdated={onCreated}
        />
      )}

      {organizations.length > 0 && projects.length > 0 && (
        <>
          <OrganizationProjectForms
            organizations={organizations}
            projects={projects}
            onChanged={onCreated}
          />
        </>
      )}
    </section>
  );
}

export function createOrganizationButtonLabel(submitting: boolean) {
  return submitting ? 'Creating...' : 'Create organization';
}
