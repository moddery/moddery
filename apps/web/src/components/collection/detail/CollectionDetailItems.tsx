import { BookMarked } from 'lucide-react';

import { type PublicCollectionItem } from '../../../lib/catalog.ts';
import type { Mod } from '../../../types.ts';
import type { SearchTag } from '../../ModCard.tsx';
import { Pagination } from '../../Pagination.tsx';
import { CollectionProjectItem } from '../CollectionProjectItem.tsx';

export function CollectionDetailItems({
  isLoading,
  items,
  onItemPage,
  onOpenProject,
  onTagSearch,
  page,
  totalPages,
}: {
  isLoading: boolean;
  items: PublicCollectionItem[];
  onItemPage: (page: number) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
  page: number;
  totalPages: number;
}) {
  if (isLoading) {
    return <CollectionDetailItemsSkeleton />;
  }

  if (items.length === 0) {
    return <CollectionDetailEmpty />;
  }

  return (
    <>
      <section className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <CollectionProjectItem
            key={item.project.slug}
            item={item}
            onOpenProject={onOpenProject}
            onTagSearch={onTagSearch}
          />
        ))}
      </section>
      {totalPages > 1 && (
        <div className="mt-5 flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onItemPage} />
        </div>
      )}
    </>
  );
}

function CollectionDetailItemsSkeleton() {
  return (
    <section className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="h-28 animate-pulse rounded bg-surface-2" />
      <div className="h-28 animate-pulse rounded bg-surface-2" />
    </section>
  );
}

function CollectionDetailEmpty() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <BookMarked className="size-6 text-accent-icon" />
      <h2 className="mt-4 font-display text-lg font-bold text-ink">
        No projects in this collection
      </h2>
    </div>
  );
}
