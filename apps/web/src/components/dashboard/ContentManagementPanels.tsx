import { type CollectionVisibility } from '@moddery/shared';
import { type FormEvent, useEffect, useState } from 'react';

import {
  addProjectToCollection,
  addProjectToOrganization,
  createCollection,
  createOrganization,
  removeProjectFromCollection,
  removeProjectFromOrganization,
  updateCollection,
  updateOrganization,
  type CreateCollectionInput,
  type CreateOrganizationInput,
  type DashboardCollection,
  type DashboardData,
  type DashboardOrganization,
  type UpdateCollectionInput,
  type UpdateOrganizationInput,
} from '../../lib/dashboard.ts';
import { timeAgo } from '../../lib/format.ts';

export {
  CollectionManagement,
  CollectionRow,
  CreateOrganizationForm,
  OrganizationRow,
};

function CreateOrganizationForm({
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
  const [color, setColor] = useState('#1d9bf0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: CreateOrganizationInput = {
      color: color.trim() || null,
      description: description.trim() || null,
      name,
      slug,
    };

    try {
      await createOrganization(input);
      setName('');
      setSlug('');
      setDescription('');
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
            label="Name"
            value={name}
            onChange={setName}
            required
          />
          <DashboardField
            label="Slug"
            value={slug}
            onChange={setSlug}
            required
          />
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
          <DashboardField
            label="Description"
            value={description}
            onChange={setDescription}
          />
          <DashboardField label="Color" value={color} onChange={setColor} />
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
            {submitting ? 'Creating...' : 'Create organization'}
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
          <AddProjectToOrganizationForm
            organizations={organizations}
            projects={projects}
            onAdded={onCreated}
          />
          <RemoveProjectFromOrganizationForm
            organizations={organizations}
            projects={projects}
            onRemoved={onCreated}
          />
        </>
      )}
    </section>
  );
}

function EditOrganizationForm({
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
    setColor(next.color ?? '#1d9bf0');
  }, [organizationId, organizations]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: UpdateOrganizationInput = {
      color: color.trim() || null,
      description: description.trim() || null,
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
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <DashboardField label="Name" value={name} onChange={setName} required />
        <DashboardField label="Slug" value={slug} onChange={setSlug} required />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
        <DashboardField
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <DashboardField label="Color" value={color} onChange={setColor} />
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
          {submitting ? 'Saving...' : 'Save organization'}
        </button>
      </div>
    </form>
  );
}

function AddProjectToOrganizationForm({
  onAdded,
  organizations,
  projects,
}: {
  onAdded: () => Promise<void>;
  organizations: DashboardOrganization[];
  projects: DashboardData['projects'];
}) {
  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id ?? '',
  );
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await addProjectToOrganization(organizationId, projectSlug);
      await onAdded();
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
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Organization
          <select
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
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
          className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add project to organization'}
        </button>
      </div>
    </form>
  );
}

function RemoveProjectFromOrganizationForm({
  onRemoved,
  organizations,
  projects,
}: {
  onRemoved: () => Promise<void>;
  organizations: DashboardOrganization[];
  projects: DashboardData['projects'];
}) {
  const [organizationId, setOrganizationId] = useState(
    organizations[0]?.id ?? '',
  );
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await removeProjectFromOrganization(organizationId, projectSlug);
      await onRemoved();
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
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Organization
          <select
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
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
          className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Removing...' : 'Remove from organization'}
        </button>
      </div>
    </form>
  );
}

function CollectionManagement({
  collections,
  onChanged,
  projects,
}: {
  collections: DashboardCollection[];
  onChanged: () => Promise<void>;
  projects: DashboardData['projects'];
}) {
  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Manage collections
        </h2>
        <p className="text-sm leading-6 text-muted">
          Create curated lists and add managed projects to them.
        </p>
      </div>

      <CreateCollectionForm onCreated={onChanged} />

      {collections.length > 0 && (
        <EditCollectionForm collections={collections} onUpdated={onChanged} />
      )}

      {collections.length > 0 && projects.length > 0 && (
        <>
          <AddProjectToCollectionForm
            collections={collections}
            projects={projects}
            onAdded={onChanged}
          />
          <RemoveProjectFromCollectionForm
            collections={collections}
            projects={projects}
            onRemoved={onChanged}
          />
        </>
      )}
    </section>
  );
}

function CreateCollectionForm({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1d9bf0');
  const [visibility, setVisibility] = useState<CollectionVisibility>('PRIVATE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: CreateCollectionInput = {
      color: color.trim() || null,
      description: description.trim() || null,
      name,
      slug,
      visibility,
    };

    try {
      await createCollection(input);
      setName('');
      setSlug('');
      setDescription('');
      setColor('#1d9bf0');
      setVisibility('PRIVATE');
      await onCreated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Collection creation failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mt-4 grid gap-3">
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardField label="Name" value={name} onChange={setName} required />
        <DashboardField label="Slug" value={slug} onChange={setSlug} required />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Visibility
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as CollectionVisibility)
            }
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
        <DashboardField
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <DashboardField label="Color" value={color} onChange={setColor} />
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
          {submitting ? 'Creating...' : 'Create collection'}
        </button>
      </div>
    </form>
  );
}

function EditCollectionForm({
  collections,
  onUpdated,
}: {
  collections: DashboardCollection[];
  onUpdated: () => Promise<void>;
}) {
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? '');
  const selected =
    collections.find((collection) => collection.id === collectionId) ??
    collections[0];
  const [name, setName] = useState(selected?.name ?? '');
  const [slug, setSlug] = useState(selected?.slug ?? '');
  const [description, setDescription] = useState(selected?.description ?? '');
  const [color, setColor] = useState(selected?.color ?? '#1d9bf0');
  const [visibility, setVisibility] = useState<CollectionVisibility>(
    selected?.visibility ?? 'PRIVATE',
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next =
      collections.find((collection) => collection.id === collectionId) ??
      collections[0];

    if (next === undefined) return;

    setCollectionId(next.id);
    setName(next.name);
    setSlug(next.slug);
    setDescription(next.description ?? '');
    setColor(next.color ?? '#1d9bf0');
    setVisibility(next.visibility);
  }, [collectionId, collections]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: UpdateCollectionInput = {
      collectionId,
      color: color.trim() || null,
      description: description.trim() || null,
      name,
      slug,
      visibility,
    };

    try {
      await updateCollection(input);
      await onUpdated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Collection update failed',
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
          Collection
          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
        <DashboardField label="Name" value={name} onChange={setName} required />
        <DashboardField label="Slug" value={slug} onChange={setSlug} required />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem_12rem]">
        <DashboardField
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <DashboardField label="Color" value={color} onChange={setColor} />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Visibility
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as CollectionVisibility)
            }
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </label>
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
          {submitting ? 'Saving...' : 'Save collection'}
        </button>
      </div>
    </form>
  );
}

function AddProjectToCollectionForm({
  collections,
  onAdded,
  projects,
}: {
  collections: DashboardCollection[];
  onAdded: () => Promise<void>;
  projects: DashboardData['projects'];
}) {
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? '');
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await addProjectToCollection(collectionId, projectSlug);
      await onAdded();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Collection update failed',
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
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Collection
          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
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
          className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add project to collection'}
        </button>
      </div>
    </form>
  );
}

function RemoveProjectFromCollectionForm({
  collections,
  onRemoved,
  projects,
}: {
  collections: DashboardCollection[];
  onRemoved: () => Promise<void>;
  projects: DashboardData['projects'];
}) {
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? '');
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await removeProjectFromCollection(collectionId, projectSlug);
      await onRemoved();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Collection update failed',
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
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Collection
          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
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
          className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Removing...' : 'Remove from collection'}
        </button>
      </div>
    </form>
  );
}

function OrganizationRow({
  organization,
}: {
  organization: DashboardOrganization;
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: organization.color ?? '#1d9bf0' }}
        />
        <a
          href={`/organizations/${organization.slug}`}
          className="font-display text-lg font-extrabold text-ink transition-colors hover:text-accent"
        >
          {organization.name}
        </a>
      </div>
      {organization.description && (
        <p className="mt-2 text-sm leading-6 text-muted">
          {organization.description}
        </p>
      )}
      <p className="mt-3 text-sm font-semibold text-muted">
        {organization.projectCount.toLocaleString('en-US')} projects ·{' '}
        {organization.memberCount.toLocaleString('en-US')} members · updated{' '}
        {timeAgo(organization.updatedAt)}
      </p>
    </article>
  );
}

function CollectionRow({ collection }: { collection: DashboardCollection }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
        />
        <h3 className="font-display text-lg font-extrabold text-ink">
          {collection.name}
        </h3>
      </div>
      {collection.description && (
        <p className="mt-2 text-sm leading-6 text-muted">
          {collection.description}
        </p>
      )}
      <p className="mt-3 text-sm font-semibold text-muted">
        {collection.projectCount.toLocaleString('en-US')} projects · updated{' '}
        {timeAgo(collection.updatedAt)}
      </p>
    </article>
  );
}

function DashboardField({
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      {label}
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
      />
    </label>
  );
}
