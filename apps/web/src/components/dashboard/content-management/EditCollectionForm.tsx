import { type CollectionVisibility } from '@moddery/shared';
import { type FormEvent, useEffect, useState } from 'react';

import {
  updateCollection,
  type DashboardCollection,
  type UpdateCollectionInput,
} from '../../../lib/dashboard.ts';
import { DashboardField } from './shared.tsx';

export function EditCollectionForm({
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
  const [iconUrl, setIconUrl] = useState(selected?.iconUrl ?? '');
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
    setIconUrl(next.iconUrl ?? '');
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
      iconUrl: iconUrl.trim() || null,
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
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem_12rem]">
        <DashboardField
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <DashboardField
          label="Icon URL"
          value={iconUrl}
          onChange={setIconUrl}
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
