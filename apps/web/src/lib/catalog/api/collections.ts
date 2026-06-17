import { apolloClient } from '../../../apollo.js';
import { collectionFromSummary, projectFromSummary } from '../mappers.js';
import {
  ADD_PROJECT_TO_COLLECTION_MUTATION,
  PUBLIC_COLLECTION_BY_SLUG_QUERY,
  PUBLIC_COLLECTION_ITEM_SEARCH_QUERY,
  PUBLIC_COLLECTIONS_QUERY,
  REMOVE_PROJECT_FROM_COLLECTION_MUTATION,
  VIEWER_COLLECTION_CHOICES_QUERY,
} from '../queries.js';
import {
  type AddProjectToCollectionMutationData,
  type AddProjectToCollectionMutationVariables,
  type PublicCollection,
  type PublicCollectionBySlugQueryData,
  type PublicCollectionBySlugQueryVariables,
  type PublicCollectionItemSearchQueryData,
  type PublicCollectionItemSearchQueryVariables,
  type PublicCollectionItemsResult,
  type PublicCollectionsQueryData,
  type PublicCollectionsQueryVariables,
  type PublicCollectionsResult,
  type RemoveProjectFromCollectionMutationData,
  type RemoveProjectFromCollectionMutationVariables,
  type ViewerCollectionChoice,
  type ViewerCollectionChoicesQueryData,
} from '../types.js';
import { hasAuthToken, throwIfAborted } from './runtime.js';

export async function fetchPublicCollections(
  search?: string | null,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<PublicCollectionsResult> {
  throwIfAborted(signal);

  const normalizedSearch = search?.trim() ?? '';
  const offset = Math.max(0, page - 1) * limit;
  const { data } = await apolloClient.query<
    PublicCollectionsQueryData,
    PublicCollectionsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_COLLECTIONS_QUERY,
    variables: {
      limit,
      offset,
      search: normalizedSearch === '' ? null : normalizedSearch,
    },
  });

  throwIfAborted(signal);

  return {
    collections: data.publicCollectionSearch.collections.map(
      collectionFromSummary,
    ),
    totalHits: data.publicCollectionSearch.totalHits,
  };
}

export async function fetchPublicCollectionBySlug(
  ownerUsername: string,
  slug: string,
  signal?: AbortSignal,
): Promise<PublicCollection> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    PublicCollectionBySlugQueryData,
    PublicCollectionBySlugQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_COLLECTION_BY_SLUG_QUERY,
    variables: { ownerUsername, slug },
  });

  throwIfAborted(signal);

  return collectionFromSummary(data.publicCollectionBySlug);
}

export async function fetchPublicCollectionItems(
  ownerUsername: string,
  slug: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<PublicCollectionItemsResult> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    PublicCollectionItemSearchQueryData,
    PublicCollectionItemSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_COLLECTION_ITEM_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      ownerUsername,
      slug,
    },
  });

  throwIfAborted(signal);

  return {
    items: data.publicCollectionItemSearch.items.map((item) => ({
      ...item,
      project: projectFromSummary(item.project),
    })),
    totalHits: data.publicCollectionItemSearch.totalHits,
  };
}

export async function fetchViewerCollectionChoices(
  signal?: AbortSignal,
): Promise<ViewerCollectionChoice[]> {
  if (!hasAuthToken()) return [];
  throwIfAborted(signal);

  const { data } = await apolloClient.query<ViewerCollectionChoicesQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_COLLECTION_CHOICES_QUERY,
  });

  throwIfAborted(signal);

  return data.viewer?.collections ?? [];
}

export async function addProjectToCollection(
  collectionId: string,
  projectSlug: string,
): Promise<void> {
  const { data } = await apolloClient.mutate<
    AddProjectToCollectionMutationData,
    AddProjectToCollectionMutationVariables
  >({
    mutation: ADD_PROJECT_TO_COLLECTION_MUTATION,
    variables: { input: { collectionId, projectSlug } },
  });

  if (!data?.addProjectToCollection) {
    throw new Error('Collection update did not return from the API');
  }
}

export async function removeProjectFromCollection(
  collectionId: string,
  projectSlug: string,
): Promise<void> {
  const { data } = await apolloClient.mutate<
    RemoveProjectFromCollectionMutationData,
    RemoveProjectFromCollectionMutationVariables
  >({
    mutation: REMOVE_PROJECT_FROM_COLLECTION_MUTATION,
    variables: { input: { collectionId, projectSlug } },
  });

  if (!data?.removeProjectFromCollection) {
    throw new Error('Collection update did not return from the API');
  }
}
