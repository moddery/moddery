import { useQuery } from '@tanstack/react-query';
import { BookMarked, Search } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';

import {
  fetchPublicCollections,
  type PublicCollection,
} from '../lib/catalog.ts';
import { timeAgo } from '../lib/format.ts';
import type { Mod } from '../types.ts';
import { CollectionProjectItem } from './collection/CollectionProjectItem.tsx';
import type { SearchTag } from './ModCard.tsx';
import { Pagination } from './Pagination.tsx';

const pageSize = 20;

export function CollectionsPage({
  onOpenCollection,
  onOpenProject,
  onTagSearch,
}: {
  onOpenCollection?: (collection: PublicCollection) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery]);

  const collectionsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchPublicCollections(normalizedQuery, page, pageSize, signal),
    queryKey: ['collections', 'public', normalizedQuery, page],
  });

  const collections = collectionsQuery.data?.collections ?? [];
  const totalHits = collectionsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));
  const hasSearch = query.trim() !== '';

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <header className="border-b border-line pb-5 sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Collections
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Browse curated project lists from the community.
          </p>
        </div>
        <label className="mt-4 block w-full max-w-sm sm:mt-0">
          <span className="sr-only">Search collections</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search collections..."
              className="h-10 w-full rounded-lg border border-line bg-control pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
            />
          </span>
        </label>
      </header>

      {collectionsQuery.isLoading ? (
        <CollectionsSkeleton />
      ) : collections.length === 0 && !hasSearch ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="text-accent-icon">
            <BookMarked className="size-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-ink">
            No public collections yet
          </h2>
          <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
            Public lists will show up here once creators publish them.
          </p>
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="text-accent-icon">
            <BookMarked className="size-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-ink">
            No collections match this search
          </h2>
          <button
            type="button"
            onClick={() => {
              setQuery('');
            }}
            className="mt-4 inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-muted">
              Showing {collections.length.toLocaleString('en-US')} of{' '}
              {totalHits.toLocaleString('en-US')} collections
            </p>
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            )}
          </div>
          {collections.map((collection) => (
            <CollectionSection
              key={collection.id}
              collection={collection}
              onOpenCollection={onOpenCollection}
              onOpenProject={onOpenProject}
              onTagSearch={onTagSearch}
            />
          ))}
          {totalPages > 1 && (
            <div className="flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function CollectionSection({
  collection,
  onOpenCollection,
  onOpenProject,
  onTagSearch,
}: {
  collection: PublicCollection;
  onOpenCollection?: (collection: PublicCollection) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  const ownerName = collection.owner.displayName ?? collection.owner.username;

  return (
    <section className="border-b border-line pb-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3 rounded-full"
              style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
            />
            <a
              href={collectionHref(collection)}
              onClick={(event) => {
                if (!onOpenCollection) return;
                event.preventDefault();
                onOpenCollection(collection);
              }}
              className="min-w-0 text-ink transition-colors hover:text-accent"
            >
              <h2 className="truncate font-display text-xl font-extrabold">
                {collection.name}
              </h2>
            </a>
          </div>
          {collection.description && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              {collection.description}
            </p>
          )}
        </div>
        <p className="text-sm font-semibold text-muted">
          {collection.projectCount.toLocaleString('en-US')} projects by{' '}
          <a
            href={`/users/${collection.owner.username}`}
            className="text-ink transition-colors hover:text-accent"
          >
            {ownerName}
          </a>{' '}
          · updated {timeAgo(collection.updatedAt)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {collection.items.map((item) => (
          <CollectionProjectItem
            key={item.project.slug}
            item={item}
            onOpenProject={onOpenProject}
            onTagSearch={onTagSearch}
          />
        ))}
      </div>
    </section>
  );
}

function collectionHref(collection: PublicCollection): string {
  return `/collections/${encodeURIComponent(
    collection.owner.username,
  )}/${encodeURIComponent(collection.slug)}`;
}

function CollectionsSkeleton() {
  return (
    <div className="mt-6 grid gap-8">
      {[0, 1, 2].map((item) => (
        <section key={item} className="border-b border-line pb-7">
          <div className="h-6 w-48 animate-pulse rounded bg-surface-2" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="h-28 animate-pulse rounded bg-surface-2" />
            <div className="h-28 animate-pulse rounded bg-surface-2" />
          </div>
        </section>
      ))}
    </div>
  );
}
