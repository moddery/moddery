import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';

import {
  fetchPublicCollections,
  type PublicCollection,
} from '../lib/catalog.ts';
import type { Mod } from '../types.ts';
import { CollectionDirectoryEmpty } from './collection/CollectionDirectoryEmpty.tsx';
import { CollectionDirectorySkeleton } from './collection/CollectionDirectorySkeleton.tsx';
import { CollectionSection } from './collection/CollectionSection.tsx';
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
        <CollectionDirectorySkeleton />
      ) : collections.length === 0 ? (
        <CollectionDirectoryEmpty
          searchActive={hasSearch}
          onClear={() => {
            setQuery('');
          }}
        />
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
