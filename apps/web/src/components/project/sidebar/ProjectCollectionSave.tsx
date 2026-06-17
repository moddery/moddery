import { useQuery } from '@tanstack/react-query';
import { BookmarkMinus, BookmarkPlus } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  addProjectToCollection,
  fetchViewerCollectionChoices,
  hasAuthToken,
  removeProjectFromCollection,
  type ProjectDetails,
  type ViewerCollectionChoice,
} from '../../../lib/catalog.ts';

export function ProjectCollectionSave({
  project,
}: {
  project: ProjectDetails;
}) {
  const [collectionId, setCollectionId] = useState('');
  const [updatingCollectionId, setUpdatingCollectionId] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);
  const authenticated = hasAuthToken();
  const collectionsQuery = useQuery({
    enabled: authenticated,
    queryFn: ({ signal }) => fetchViewerCollectionChoices(signal),
    queryKey: ['collections', 'viewer', 'choices'],
  });
  const collections = collectionsQuery.data ?? [];
  const savedCollections = useMemo(
    () =>
      collections.filter((collection) =>
        collectionHasProject(collection, project.slug),
      ),
    [collections, project.slug],
  );
  const availableCollections = useMemo(
    () =>
      collections.filter(
        (collection) => !collectionHasProject(collection, project.slug),
      ),
    [collections, project.slug],
  );
  const selectedCollectionId = collectionId || availableCollections[0]?.id;

  if (!authenticated) {
    return null;
  }

  async function saveProject() {
    if (selectedCollectionId === undefined) {
      return;
    }

    setUpdatingCollectionId(selectedCollectionId);
    setMessage(null);
    try {
      await addProjectToCollection(selectedCollectionId, project.slug);
      await collectionsQuery.refetch();
      setCollectionId('');
      setMessage('Saved to collection.');
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Save failed');
    } finally {
      setUpdatingCollectionId(null);
    }
  }

  async function removeProject(collection: ViewerCollectionChoice) {
    setUpdatingCollectionId(collection.id);
    setMessage(null);
    try {
      await removeProjectFromCollection(collection.id, project.slug);
      await collectionsQuery.refetch();
      setMessage(`Removed from ${collection.name}.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Remove failed');
    } finally {
      setUpdatingCollectionId(null);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-line bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
        <BookmarkPlus className="size-4 text-accent-icon" />
        Save to collection
      </div>

      {collectionsQuery.isLoading ? (
        <p className="mt-2 text-xs font-semibold text-muted">
          Loading collections...
        </p>
      ) : collections.length === 0 ? (
        <p className="mt-2 text-xs font-semibold leading-5 text-muted">
          Create a collection from your dashboard first.
        </p>
      ) : (
        <>
          {savedCollections.length > 0 && (
            <div className="mt-3 grid gap-2">
              {savedCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-2 py-1.5"
                >
                  <span className="min-w-0 truncate text-xs font-bold text-muted">
                    {collection.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => void removeProject(collection)}
                    disabled={updatingCollectionId === collection.id}
                    className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-bold text-accent-icon transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <BookmarkMinus className="size-3.5" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {availableCollections.length > 0 && (
            <div className="mt-3 grid gap-2">
              <select
                value={selectedCollectionId ?? ''}
                onChange={(event) => setCollectionId(event.target.value)}
                className="h-9 rounded-md border border-line bg-control px-2 text-sm font-semibold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
              >
                {availableCollections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name} ({collection.projectCount})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void saveProject()}
                disabled={updatingCollectionId === selectedCollectionId}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-control px-3 text-sm font-bold text-accent-icon transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BookmarkPlus className="size-4" />
                {updatingCollectionId === selectedCollectionId
                  ? 'Saving...'
                  : 'Save'}
              </button>
            </div>
          )}

          {availableCollections.length === 0 && (
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              This project is already in each collection.
            </p>
          )}
        </>
      )}

      {message && (
        <p className="mt-2 text-xs font-semibold leading-5 text-muted">
          {message}
        </p>
      )}
    </div>
  );
}

function collectionHasProject(
  collection: ViewerCollectionChoice,
  projectSlug: string,
): boolean {
  return collection.items.some((item) => item.project.slug === projectSlug);
}
