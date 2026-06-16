import { useQuery } from '@tanstack/react-query';
import { BookMarked } from 'lucide-react';

import {
  fetchPublicCollections,
  type PublicCollection,
} from '../lib/catalog.ts';
import { timeAgo } from '../lib/format.ts';
import type { Mod } from '../types.ts';
import { ModCard } from './ModCard.tsx';
import type { SearchTag } from './ModCard.tsx';

export function CollectionsPage({
  onOpenProject,
  onTagSearch,
}: {
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  const collectionsQuery = useQuery({
    queryFn: ({ signal }) => fetchPublicCollections(signal),
    queryKey: ['collections', 'public'],
  });

  const collections = collectionsQuery.data ?? [];

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <header className="border-b border-line pb-5">
        <h1 className="font-display text-3xl font-extrabold text-ink">
          Collections
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Browse curated project lists from the community.
        </p>
      </header>

      {collectionsQuery.isLoading ? (
        <CollectionsSkeleton />
      ) : collections.length === 0 ? (
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
      ) : (
        <div className="mt-6 grid gap-8">
          {collections.map((collection) => (
            <CollectionSection
              key={collection.id}
              collection={collection}
              onOpenProject={onOpenProject}
              onTagSearch={onTagSearch}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function CollectionSection({
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
    <section className="border-b border-line pb-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3 rounded-full"
              style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
            />
            <h2 className="truncate font-display text-xl font-extrabold text-ink">
              {collection.name}
            </h2>
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
        {collection.projects.map((mod) => (
          <ModCard
            key={mod.slug}
            mod={mod}
            layout="list"
            onOpen={onOpenProject}
            onTagSearch={onTagSearch}
          />
        ))}
      </div>
    </section>
  );
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
