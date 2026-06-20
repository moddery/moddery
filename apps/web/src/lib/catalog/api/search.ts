import { apolloClient } from '../../../apollo.js';
import { type ProjectType } from '../../../types.js';
import { projectKindFromType } from '../../projectTypes.js';
import { projectFromSummary, projectSearchTags } from '../mappers.js';
import { PLATFORM_METADATA_QUERY, PROJECTS_QUERY } from '../queries.js';
import {
  type FilterTags,
  type PlatformMetadata,
  type PlatformMetadataQueryData,
  type ProjectsQueryData,
  type ProjectsQueryVariables,
  type SearchProjectsParams,
  type SearchProjectsResult,
  type SortKey,
} from '../types.js';
import { throwIfAborted } from './runtime.js';

export async function searchProjects({
  projectType,
  query,
  sort,
  page,
  limit,
  versions,
  loaders,
  licenses = [],
  categories,
  signal,
}: SearchProjectsParams): Promise<SearchProjectsResult> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ProjectsQueryData,
    ProjectsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PROJECTS_QUERY,
    variables: {
      query: {
        limit,
        offset: Math.max(0, page - 1) * limit,
        ...(query.trim() ? { search: query.trim() } : {}),
        sort: sortToApiSort(sort),
        tags: projectSearchTags({
          categories,
          licenses,
          loaders,
          projectType,
          versions,
        }),
      },
    },
  });

  throwIfAborted(signal);

  return {
    projects: data.projectSearch.projects.map(projectFromSummary),
    totalHits: data.projectSearch.totalHits,
  };
}

export async function fetchFilterTags(
  projectType: ProjectType,
  signal?: AbortSignal,
): Promise<FilterTags> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<PlatformMetadataQueryData>({
    fetchPolicy: 'cache-first',
    query: PLATFORM_METADATA_QUERY,
  });

  throwIfAborted(signal);

  const projectKind = projectKindFromType(projectType);

  return {
    categories: data.platformMetadata.categories.filter(
      (category) =>
        category.projectKind === null || category.projectKind === projectKind,
    ),
    licenses: data.platformMetadata.licenses,
    loaders: data.platformMetadata.loaders,
    versions: data.platformMetadata.gameVersions,
  };
}

export async function fetchPlatformMetadata(
  signal?: AbortSignal,
): Promise<PlatformMetadata> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<PlatformMetadataQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'cache-first',
    query: PLATFORM_METADATA_QUERY,
  });

  throwIfAborted(signal);

  return data.platformMetadata;
}

function sortToApiSort(sort: SortKey): string {
  if (sort === 'downloads') return 'downloads';
  if (sort === 'follows') return 'follows';
  if (sort === 'updated') return 'updated';
  if (sort === 'name') return 'name';
  return 'relevance';
}
