import { type FormEvent, useState } from 'react';
import { Trash2 } from 'lucide-react';

import {
  removeProjectGalleryImage,
  type DashboardGalleryImage,
  updateProjectGalleryImage,
} from '../../../../lib/dashboard.ts';
import { DashboardField, nullableText } from '../shared.tsx';

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await updateProjectGalleryImage({
        description: nullableText(description),
        displayUrl,
        featured,
        imageId: image.id,
        rawUrl,
        sortOrder: parseSortOrder(sortOrder),
        title: nullableText(title),
      });
      await onChanged();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Gallery image update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    setSubmitting(true);
    setError(null);

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
      setSubmitting(false);
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
            <DashboardField label="Title" value={title} onChange={setTitle} />
            <DashboardField
              label="Sort order"
              value={sortOrder}
              onChange={setSortOrder}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="size-4 accent-accent"
            />
            Featured
          </label>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          label="Raw image URL"
          value={rawUrl}
          onChange={setRawUrl}
          required
        />
        <DashboardField
          label="Display image URL"
          value={displayUrl}
          onChange={setDisplayUrl}
          required
        />
      </div>

      <label className="grid gap-1 text-sm font-bold text-ink">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-20 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
        />
      </label>

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
          {submitting ? 'Saving...' : 'Save image'}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void remove()}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-control px-3 text-sm font-bold text-accent-icon transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="size-4" />
          Remove
        </button>
      </div>
    </form>
  );
}

function parseSortOrder(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
