import { BookmarkMinus, BookmarkPlus } from 'lucide-react';

import {
  collectionPath,
  dashboardPath,
  type SelectedCollection,
} from '../../../app/routing.ts';
import {
  type ProjectDetails,
  type ViewerCollectionChoice,
} from '../../../lib/catalog.ts';
import { useProjectCollectionSaveState } from './collection-save/useProjectCollectionSaveState.ts';

export function ProjectCollectionSave({
  project,
}: {
  project: ProjectDetails;
}) {
  const collections = useProjectCollectionSaveState({ project });

  if (!collections.authenticated) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg border border-line bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
        <BookmarkPlus className="size-4 text-accent-icon" />
        Save to collection
      </div>

      {collections.collectionsQuery.isLoading ? (
        <p className="mt-2 text-xs font-semibold text-muted">
          Loading collections...
        </p>
      ) : collections.collections.length === 0 ? (
        <p className="mt-2 text-xs font-semibold leading-5 text-muted">
          <a
            className="font-bold text-ink transition-colors hover:text-accent"
            href={dashboardPath('dashboard-collections')}
          >
            Create a collection
          </a>{' '}
          from your dashboard first.
        </p>
      ) : (
        <>
          {collections.savedCollections.length > 0 && (
            <div className="mt-3 grid gap-2">
              {collections.savedCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-2 py-1.5"
                >
                  <a
                    className="min-w-0 truncate text-xs font-bold text-muted transition-colors hover:text-accent"
                    href={viewerCollectionHref(collection)}
                  >
                    {collection.name}
                  </a>
                  <button
                    type="button"
                    onClick={() => void collections.removeProject(collection)}
                    disabled={
                      collections.updatingCollectionId === collection.id
                    }
                    className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-bold text-accent-icon transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <BookmarkMinus className="size-3.5" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {collections.availableCollections.length > 0 && (
            <div className="mt-3 grid gap-2">
              <select
                value={collections.selectedCollectionId ?? ''}
                onChange={(event) =>
                  collections.setCollectionId(event.target.value)
                }
                className="h-9 rounded-md border border-line bg-control px-2 text-sm font-semibold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
              >
                {collections.availableCollections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name} ({collection.projectCount})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void collections.saveProject()}
                disabled={
                  collections.updatingCollectionId ===
                  collections.selectedCollectionId
                }
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-control px-3 text-sm font-bold text-accent-icon transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BookmarkPlus className="size-4" />
                {collections.updatingCollectionId ===
                collections.selectedCollectionId
                  ? 'Saving...'
                  : 'Save'}
              </button>
            </div>
          )}

          {collections.availableCollections.length === 0 && (
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              This project is already in each collection.
            </p>
          )}
        </>
      )}

      {collections.message && (
        <p className="mt-2 text-xs font-semibold leading-5 text-muted">
          {collections.message}
        </p>
      )}
    </div>
  );
}

export function viewerCollectionHref(
  collection: Pick<ViewerCollectionChoice, 'owner' | 'slug'>,
) {
  const selected: SelectedCollection = {
    ownerUsername: collection.owner.username,
    slug: collection.slug,
  };

  return collectionPath(selected);
}
