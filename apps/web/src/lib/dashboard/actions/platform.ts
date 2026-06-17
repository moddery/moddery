import { type ProjectKind } from '@moddery/shared';
import { apolloClient } from '../../../apollo.js';
import {
  CATEGORY_TAXONOMY_QUERY,
  GAME_VERSION_TAXONOMY_QUERY,
  UPSERT_CATEGORY_MUTATION,
  UPSERT_GAME_VERSION_MUTATION,
} from '../graphql.js';
import {
  type CategoryTaxonomyQueryData,
  type GameVersionTaxonomyQueryData,
  type UpsertCategoryMutationData,
  type UpsertCategoryMutationVariables,
  type UpsertGameVersionMutationData,
  type UpsertGameVersionMutationVariables,
} from '../internal-types.js';
import { type CategoryTaxonomy, type GameVersionTaxonomy } from '../types.js';

export async function fetchCategoryTaxonomy(
  signal?: AbortSignal,
): Promise<CategoryTaxonomy[]> {
  const { data } = await apolloClient.query<CategoryTaxonomyQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: CATEGORY_TAXONOMY_QUERY,
  });

  return data.categories;
}

export async function fetchGameVersionTaxonomy(
  signal?: AbortSignal,
): Promise<GameVersionTaxonomy[]> {
  const { data } = await apolloClient.query<GameVersionTaxonomyQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: GAME_VERSION_TAXONOMY_QUERY,
  });

  return data.gameVersions;
}

export async function upsertCategory(input: {
  description: string | null;
  name: string;
  projectKind: ProjectKind | null;
  slug: string;
}): Promise<CategoryTaxonomy> {
  const { data } = await apolloClient.mutate<
    UpsertCategoryMutationData,
    UpsertCategoryMutationVariables
  >({
    mutation: UPSERT_CATEGORY_MUTATION,
    variables: { input },
  });

  if (!data?.upsertCategory) {
    throw new Error('Category did not return from the API');
  }

  return data.upsertCategory;
}

export async function upsertGameVersion(input: {
  isActive: boolean;
  version: string;
}): Promise<GameVersionTaxonomy> {
  const { data } = await apolloClient.mutate<
    UpsertGameVersionMutationData,
    UpsertGameVersionMutationVariables
  >({
    mutation: UPSERT_GAME_VERSION_MUTATION,
    variables: { input },
  });

  if (!data?.upsertGameVersion) {
    throw new Error('Game version did not return from the API');
  }

  return data.upsertGameVersion;
}
