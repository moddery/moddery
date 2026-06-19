import { type FormEvent, useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

import {
  type DashboardCollection,
  updateCollectionProject,
} from '../../../lib/dashboard.ts';
import { relationProjectHref } from './project-relations/relation-route-links.ts';

export function CollectionProjectOrderForm({
  collections,
  onChanged,
}: {
  collections: DashboardCollection[];
  onChanged: () => Promise<void>;
}) {
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? '');
  const collection =
    collections.find((candidate) => candidate.id === collectionId) ??
    collections[0];

  useEffect(() => {
    if (collection === undefined) return;
    setCollectionId(collection.id);
  }, [collection]);

  if (collection === undefined || collection.items.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 grid gap-3 border-t border-line pt-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_2fr] md:items-end">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Collection order
          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {collections.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm leading-6 text-muted">
          Lower numbers appear first on collection pages.
        </p>
      </div>

      <div className="grid gap-2">
        {collection.items.map((item) => (
          <CollectionProjectOrderRow
            key={item.project.slug}
            collectionId={collection.id}
            item={item}
            onChanged={onChanged}
          />
        ))}
      </div>
    </div>
  );
}

function CollectionProjectOrderRow({
  collectionId,
  item,
  onChanged,
}: {
  collectionId: string;
  item: DashboardCollection['items'][number];
  onChanged: () => Promise<void>;
}) {
  const [sortOrder, setSortOrder] = useState(String(item.sortOrder));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const projectHref = relationProjectHref({
    kind: item.project.kind,
    slug: item.project.slug,
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await updateCollectionProject({
        collectionId,
        projectSlug: item.project.slug,
        sortOrder: parseSortOrder(sortOrder),
      });
      await onChanged();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Collection project update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="grid gap-3 rounded-lg border border-line bg-surface px-3 py-3 md:grid-cols-[minmax(0,1fr)_7rem_auto_auto] md:items-end"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink">
          {item.project.title}
        </p>
        <p className="mt-1 truncate text-xs font-semibold text-muted">
          {item.project.summary}
        </p>
        {error && (
          <p className="mt-2 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
      </div>
      <label className="grid gap-1 text-sm font-bold text-ink">
        Order
        <input
          disabled={submitting}
          type="number"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      <a
        href={projectHref}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        Open
      </a>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {collectionProjectOrderButtonLabel(submitting)}
      </button>
    </form>
  );
}

export function collectionProjectOrderButtonLabel(submitting: boolean) {
  return submitting ? 'Saving...' : 'Save';
}

export function parseSortOrder(value: string): number {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    throw new Error('Collection order must be an integer');
  }

  return Number.parseInt(trimmed, 10);
}
