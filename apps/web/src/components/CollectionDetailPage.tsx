import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookMarked } from 'lucide-react';

import {
  fetchPublicCollectionBySlug,
  type PublicCollection,
} from '../lib/catalog.ts';
import { timeAgo } from '../lib/format.ts';
import type { Mod } from '../types.ts';
import { CollectionProjectItem } from './collection/CollectionProjectItem.tsx';
import type { SearchTag } from './ModCard.tsx';

export function CollectionDetailPage({
  onBack,
  onOpenProject,
  onTagSearch,
  ownerUsername,
  slug,
}: {
  onBack: () => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
  ownerUsername: string;
  slug: string;
}) {
  const collectionQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchPublicCollectionBySlug(ownerUsername, slug, signal),
    queryKey: ['collections', 'detail', ownerUsername, slug],
  });

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
      >
        <ArrowLeft className="size-4" />
        Collections
      </button>

      {collectionQuery.isLoading ? (
        <CollectionDetailSkeleton />
      ) : collectionQuery.error ? (
        <p className="mt-5 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {collectionQuery.error instanceof Error
            ? collectionQuery.error.message
            : 'Collection failed to load'}
        </p>
      ) : collectionQuery.data === undefined ? (
        <p className="mt-5 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Collection did not return from the API.
        </p>
      ) : (
        <CollectionDetail
          collection={collectionQuery.data}
          onOpenProject={onOpenProject}
          onTagSearch={onTagSearch}
        />
      )}
    </main>
  );
}

function CollectionDetail({
  collection,
  onOpenProject,
  onTagSearch,
}: {
  collection: PublicCollection;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  const ownerName = collection.owner.displayName ?? collection.owner.username;

  return (
    <>
      <header className="mt-5 border-b border-line pb-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="size-4 rounded-full"
            style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
          />
          <h1 className="font-display text-3xl font-extrabold text-ink">
            {collection.name}
          </h1>
        </div>
        {collection.description && (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            {collection.description}
          </p>
        )}
        <p className="mt-3 text-sm font-semibold text-muted">
          {collection.projectCount.toLocaleString('en-US')} projects by{' '}
          <a
            href={`/users/${collection.owner.username}`}
            className="text-ink transition-colors hover:text-accent"
          >
            {ownerName}
          </a>{' '}
          · updated {timeAgo(collection.updatedAt)}
        </p>
      </header>

      {collection.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <BookMarked className="size-6 text-accent-icon" />
          <h2 className="mt-4 font-display text-lg font-bold text-ink">
            No projects in this collection
          </h2>
        </div>
      ) : (
        <section className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {collection.items.map((item) => (
            <CollectionProjectItem
              key={item.project.slug}
              item={item}
              onOpenProject={onOpenProject}
              onTagSearch={onTagSearch}
            />
          ))}
        </section>
      )}
    </>
  );
}

function CollectionDetailSkeleton() {
  return (
    <div className="mt-5">
      <div className="h-8 w-64 animate-pulse rounded bg-surface-2" />
      <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded bg-surface-2" />
        <div className="h-28 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}
