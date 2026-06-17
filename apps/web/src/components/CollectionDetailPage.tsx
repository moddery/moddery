import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import {
  fetchPublicCollectionBySlug,
  fetchPublicCollectionItems,
} from '../lib/catalog.ts';
import type { Mod } from '../types.ts';
import { CollectionDetailContent } from './collection/detail/CollectionDetailContent.tsx';
import { CollectionDetailSkeleton } from './collection/detail/CollectionDetailSkeleton.tsx';
import type { SearchTag } from './ModCard.tsx';

const itemPageSize = 20;

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
  const [itemPage, setItemPage] = useState(1);
  const collectionQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchPublicCollectionBySlug(ownerUsername, slug, signal),
    queryKey: ['collections', 'detail', ownerUsername, slug],
  });
  const itemsQuery = useQuery({
    enabled: Boolean(collectionQuery.data),
    queryFn: ({ signal }) =>
      fetchPublicCollectionItems(
        ownerUsername,
        slug,
        itemPage,
        itemPageSize,
        signal,
      ),
    queryKey: ['collections', 'detail', ownerUsername, slug, 'items', itemPage],
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
        <CollectionDetailContent
          collection={collectionQuery.data}
          isLoadingItems={itemsQuery.isLoading}
          items={itemsQuery.data?.items ?? collectionQuery.data.items}
          onItemPage={setItemPage}
          itemPage={itemPage}
          itemTotalPages={Math.max(
            1,
            Math.ceil(
              (itemsQuery.data?.totalHits ??
                collectionQuery.data.projectCount) / itemPageSize,
            ),
          )}
          onOpenProject={onOpenProject}
          onTagSearch={onTagSearch}
        />
      )}
    </main>
  );
}
