import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  addProjectToCollection,
  fetchViewerCollectionChoices,
  hasAuthToken,
  removeProjectFromCollection,
  type ProjectDetails,
  type ViewerCollectionChoice,
} from '../../../../lib/catalog.ts';

export function useProjectCollectionSaveState({
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

  return {
    authenticated,
    availableCollections,
    collectionId,
    collections,
    collectionsQuery,
    message,
    removeProject,
    saveProject,
    savedCollections,
    selectedCollectionId,
    setCollectionId,
    updatingCollectionId,
  };
}

function collectionHasProject(
  collection: ViewerCollectionChoice,
  projectSlug: string,
): boolean {
  return collection.items.some((item) => item.project.slug === projectSlug);
}
