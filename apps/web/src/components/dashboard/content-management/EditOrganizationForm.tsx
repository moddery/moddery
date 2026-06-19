import { type FormEvent, useEffect, useState } from 'react';

import {
  updateOrganization,
  type DashboardOrganization,
  type UpdateOrganizationInput,
} from '../../../lib/dashboard.ts';
import { DashboardField } from './shared.tsx';

export function EditOrganizationForm({
  onUpdated,
  organizations,
}: {
  onUpdated: () => Promise<void>;
  organizations: DashboardOrganization[];
}) {
  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id ?? '',
  );
  const selected =
    organizations.find((organization) => organization.id === organizationId) ??
    organizations[0];
  const [name, setName] = useState(selected?.name ?? '');
  const [slug, setSlug] = useState(selected?.slug ?? '');
  const [description, setDescription] = useState(selected?.description ?? '');
  const [iconUrl, setIconUrl] = useState(selected?.iconUrl ?? '');
  const [color, setColor] = useState(selected?.color ?? '#1d9bf0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next =
      organizations.find(
        (organization) => organization.id === organizationId,
      ) ?? organizations[0];

    if (next === undefined) return;

    setOrganizationId(next.id);
    setName(next.name);
    setSlug(next.slug);
    setDescription(next.description ?? '');
    setIconUrl(next.iconUrl ?? '');
    setColor(next.color ?? '#1d9bf0');
  }, [organizationId, organizations]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: UpdateOrganizationInput = {
      color: color.trim() || null,
      description: description.trim() || null,
      iconUrl: iconUrl.trim() || null,
      name,
      organizationId,
      slug,
    };

    try {
      await updateOrganization(input);
      await onUpdated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Organization update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-5 grid gap-3 border-t border-line pt-5"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Organization
          <select
            disabled={submitting}
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
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
          {editOrganizationButtonLabel(submitting)}
        </button>
      </div>
    </form>
  );
}

export function editOrganizationButtonLabel(submitting: boolean) {
  return submitting ? 'Saving...' : 'Save organization';
}
