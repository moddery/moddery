import type { UserCollectionPreview } from '../../lib/users.ts';
import type { Mod } from '../../types.ts';
import { type SearchTag } from '../ModCard.tsx';
import { Pagination } from '../Pagination.tsx';
import { CollectionPreview } from './CollectionPreview.tsx';

export function UserCollectionsSection({
  collections,
  loading,
  onOpenCollection,
  onOpenProject,
  onTagSearch,
  ownerUsername,
  page,
  setPage,
  total,
  totalPages,
}: {
  collections: UserCollectionPreview[];
  loading: boolean;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
  ownerUsername: string;
  page: number;
  setPage: (page: number) => void;
  total: number;
  totalPages: number;
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Collections
        </h2>
        <span className="text-sm font-semibold text-muted">
          {total.toLocaleString('en-US')} total
        </span>
      </div>

      {loading ? (
        <UserCollectionListSkeleton />
      ) : collections.length === 0 ? (
        <p className="py-8 text-sm text-muted">No public collections yet.</p>
      ) : (
        <>
          <div className="mt-4 grid gap-5">
            {collections.map((collection) => (
              <CollectionPreview
                key={collection.id}
                collection={collection}
                ownerUsername={ownerUsername}
                onOpenCollection={onOpenCollection}
                onOpenProject={onOpenProject}
                onTagSearch={onTagSearch}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-5 flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function UserCollectionListSkeleton() {
  return (
    <div className="mt-4 grid gap-5">
      {[0, 1].map((item) => (
        <section key={item} className="border-b border-line pb-5">
          <div className="h-6 w-56 animate-pulse rounded bg-surface-2" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="h-24 animate-pulse rounded bg-surface-2" />
            <div className="h-24 animate-pulse rounded bg-surface-2" />
          </div>
        </section>
      ))}
    </div>
  );
}
