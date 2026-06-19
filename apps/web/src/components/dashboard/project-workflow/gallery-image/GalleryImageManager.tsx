import { type FormEvent, useState } from 'react';
import { Trash2 } from 'lucide-react';

import {
  removeProjectGalleryImage,
  type DashboardGalleryImage,
  updateProjectGalleryImage,
} from '../../../../lib/dashboard.ts';
import { DashboardField, nullableText } from '../shared.tsx';

type GalleryImageBusyAction = 'remove' | 'save';

export function GalleryImageManager({
  images,
  onChanged,
}: {
  images: DashboardGalleryImage[];
  onChanged: () => Promise<void>;
}) {
  return (
    <div className="grid gap-3">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted">
        Existing images
      </h3>
      <div className="grid gap-3">
        {images.map((image) => (
          <GalleryImageManagerRow
            key={image.id}
            image={image}
            onChanged={onChanged}
          />
        ))}
      </div>
    </div>
  );
}

function GalleryImageManagerRow({
  image,
  onChanged,
}: {
  image: DashboardGalleryImage;
  onChanged: () => Promise<void>;
}) {
  const [description, setDescription] = useState(image.description ?? '');
  const [displayUrl, setDisplayUrl] = useState(image.displayUrl);
  const [featured, setFeatured] = useState(image.featured);
  const [rawUrl, setRawUrl] = useState(image.rawUrl);
  const [sortOrder, setSortOrder] = useState(String(image.sortOrder));
  const [title, setTitle] = useState(image.title ?? '');
  const [busyAction, setBusyAction] = useState<GalleryImageBusyAction | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const submitting = busyAction !== null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction('save');
    setError(null);
    setMessage(null);

    try {
      await updateProjectGalleryImage({
        description: nullableText(description),
        displayUrl,
        featured,
        imageId: image.id,
        rawUrl,
        sortOrder: parseGalleryImageSortOrder(sortOrder),
        title: nullableText(title),
      });
      setMessage(galleryImageActionMessage());
      await onChanged();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Gallery image update failed',
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function remove() {
    setBusyAction('remove');
    setError(null);
    setMessage(null);

    try {
      await removeProjectGalleryImage({ imageId: image.id });
      await onChanged();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Gallery image removal failed',
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="grid gap-3 rounded-lg border border-line bg-surface px-3 py-3"
    >
      <div className="grid gap-3 md:grid-cols-[9rem_1fr]">
        <img
          src={displayUrl}
          alt={title}
          className="aspect-video w-full rounded-lg border border-line bg-surface-2 object-cover"
        />
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-[1fr_8rem]">
            <DashboardField
              disabled={submitting}
              label="Title"
              value={title}
              onChange={setTitle}
            />
            <DashboardField
              disabled={submitting}
              label="Sort order"
              value={sortOrder}
              onChange={setSortOrder}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input
              disabled={submitting}
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="size-4 accent-accent disabled:cursor-not-allowed"
            />
            Featured
          </label>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          disabled={submitting}
          label="Raw image URL"
          value={rawUrl}
          onChange={setRawUrl}
          required
        />
        <DashboardField
          disabled={submitting}
          label="Display image URL"
          value={displayUrl}
          onChange={setDisplayUrl}
          required
        />
      </div>

      <label className="grid gap-1 text-sm font-bold text-ink">
        Description
        <textarea
          disabled={submitting}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-20 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      {message && (
        <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {galleryImageSaveButtonLabel(busyAction)}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void remove()}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-control px-3 text-sm font-bold text-accent-icon transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="size-4" />
          {galleryImageRemoveButtonLabel(busyAction)}
        </button>
      </div>
    </form>
  );
}

export function parseGalleryImageSortOrder(value: string): number {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    throw new Error('Gallery image order must be an integer');
  }

  return Number.parseInt(trimmed, 10);
}

export function galleryImageActionMessage() {
  return 'Image saved.';
}

export function galleryImageSaveButtonLabel(
  busyAction: GalleryImageBusyAction | null,
) {
  return busyAction === 'save' ? 'Saving...' : 'Save image';
}

export function galleryImageRemoveButtonLabel(
  busyAction: GalleryImageBusyAction | null,
) {
  return busyAction === 'remove' ? 'Removing...' : 'Remove';
}
