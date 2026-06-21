import { type CollectionVisibility } from '@moddery/shared';
import { type FormEvent, useEffect, useState } from 'react';

import {
  updateCollection,
  uploadOwnerImage,
  type DashboardCollection,
  type UpdateCollectionInput,
} from '../../../lib/dashboard.ts';
import { FileDropzone } from '../../ui/dashboard/index.ts';
import {
  assertUpdateCollectionInput,
  normalizeUpdateCollectionInput,
} from './collection-input.ts';
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
  const [iconFile, setIconFile] = useState<File | null>(null);
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
    setIconFile(null);
    setColor(next.color ?? '#1d9bf0');
    setVisibility(next.visibility);
  }, [collectionId, collections]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let nextIconUrl = iconUrl;
      if (iconFile !== null) {
        const target = await uploadOwnerImage({
          file: iconFile,
          ownerId: collectionId,
          ownerType: 'collection',
          uploadKind: 'collection-icon',
        });
        nextIconUrl = target.objectUrl;
        setIconUrl(nextIconUrl);
        setIconFile(null);
      }

      const input: UpdateCollectionInput = normalizeUpdateCollectionInput({
        collectionId,
        color,
        description,
        iconUrl: nextIconUrl,
        name,
        slug,
        visibility,
      });

      assertUpdateCollectionInput(input);
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
            disabled={submitting}
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
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
      <div className="grid gap-3 md:grid-cols-[1fr_10rem_12rem]">
        <DashboardField
          disabled={submitting}
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <DashboardField
          disabled={submitting}
          label="Color"
          value={color}
          onChange={setColor}
        />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Visibility
          <select
            disabled={submitting}
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as CollectionVisibility)
            }
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </label>
      </div>
      <FileDropzone
        accept="image/png,image/jpeg,image/gif,image/webp"
        disabled={submitting}
        file={iconFile}
        existingPreviewUrl={iconUrl.trim() || null}
        label="Icon"
        onFileChange={setIconFile}
      />

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
          {editCollectionButtonLabel(submitting)}
        </button>
      </div>
    </form>
  );
}

export function editCollectionButtonLabel(submitting: boolean) {
  return submitting ? 'Saving...' : 'Save collection';
}
