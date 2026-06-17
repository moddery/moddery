import { type ReportReason } from '@moddery/shared';

import { apolloClient, authTokenStorageKey } from '../apollo.js';
import { type ProjectType } from '../types.js';
import {
  collectionFromSummary,
  memberFromSummary,
  projectDetailsFromSummary,
  projectFromSummary,
  projectSearchTags,
  versionFromSummary,
} from './catalog/mappers.js';
import { projectKindFromType } from './projectTypes.js';
import {
  CREATE_PROJECT_REPORT_MUTATION,
  CREATE_VERSION_REPORT_MUTATION,
  ADD_PROJECT_TO_COLLECTION_MUTATION,
  FOLLOW_PROJECT_MUTATION,
  PLATFORM_METADATA_QUERY,
  PROJECT_MEMBER_SEARCH_QUERY,
  PROJECTS_QUERY,
  PROJECT_ANALYTICS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECT_MEMBERS_QUERY,
  PUBLIC_COLLECTION_BY_SLUG_QUERY,
  PUBLIC_COLLECTION_ITEM_SEARCH_QUERY,
  PUBLIC_COLLECTIONS_QUERY,
  RECORD_DOWNLOAD_MUTATION,
  RECORD_PROJECT_VIEW_MUTATION,
  REMOVE_PROJECT_FROM_COLLECTION_MUTATION,
  UNFOLLOW_PROJECT_MUTATION,
  VERSION_SEARCH_FOR_PROJECT_QUERY,
  VERSIONS_FOR_PROJECT_QUERY,
  VIEWER_FOLLOWED_PROJECTS_QUERY,
  VIEWER_COLLECTION_CHOICES_QUERY,
  VIEWER_PROJECT_FOLLOW_STATE_QUERY,
} from './catalog/queries.js';
import {
  type CreateProjectReportMutationData,
  type CreateProjectReportMutationVariables,
  type CreateVersionReportMutationData,
  type CreateVersionReportMutationVariables,
  type AddProjectToCollectionMutationData,
  type AddProjectToCollectionMutationVariables,
  type FilterTags,
  type PlatformMetadataQueryData,
  type ProjectAnalytics,
  type ProjectAnalyticsQueryData,
  type ProjectAnalyticsQueryVariables,
  type ProjectBySlugQueryData,
  type ProjectBySlugQueryVariables,
  type ProjectDetails,
  type ProjectFollowState,
  type ProjectFollowStateMutationData,
  type ProjectFollowStateQueryData,
  type ProjectMember,
  type ProjectMemberSearchQueryData,
  type ProjectMemberSearchQueryVariables,
  type ProjectMemberSearchResult,
  type ProjectMembersQueryData,
  type ProjectMembersQueryVariables,
  type ProjectVersionSearchResult,
  type ProjectsQueryData,
  type ProjectsQueryVariables,
  type ProjectVersion,
  type PublicCollection,
  type PublicCollectionBySlugQueryData,
  type PublicCollectionBySlugQueryVariables,
  type PublicCollectionItemSearchQueryData,
  type PublicCollectionItemSearchQueryVariables,
  type PublicCollectionItemsResult,
  type PublicCollectionsResult,
  type PublicCollectionsQueryData,
  type PublicCollectionsQueryVariables,
  type RecordDownloadMutationData,
  type RecordDownloadMutationVariables,
  type RecordProjectViewMutationData,
  type RecordProjectViewMutationVariables,
  type ReportSummary,
  type RemoveProjectFromCollectionMutationData,
  type RemoveProjectFromCollectionMutationVariables,
  type SearchProjectsParams,
  type SearchProjectsResult,
  type SortKey,
  type VersionSearchForProjectQueryData,
  type VersionSearchForProjectQueryVariables,
  type VersionsForProjectQueryData,
  type VersionsForProjectQueryVariables,
  type ViewerFollowedProjectsQueryData,
  type ViewerFollowedProjectsQueryVariables,
  type ViewerFollowedProjectsResult,
  type ViewerCollectionChoice,
  type ViewerCollectionChoicesQueryData,
} from './catalog/types.js';

export type {
  CategoryFilterTag,
  FilterTags,
  ProjectAnalytics,
  ProjectAnalyticsDay,
  ProjectDetails,
  ProjectFile,
  ProjectFollowState,
  ProjectGalleryImage,
  ProjectMember,
  ProjectMemberSearchResult,
  ProjectVersion,
  ProjectVersionSearchResult,
  PublicCollection,
  PublicCollectionItem,
  PublicCollectionsResult,
  ReportSummary,
  SearchProjectsParams,
  SearchProjectsResult,
  SortKey,
  VersionDependency,
  ViewerCollectionChoice,
  ViewerFollowedProjectsResult,
} from './catalog/types.js';

export async function searchProjects({
  projectType,
  query,
  sort,
  page,
  limit,
  versions,
  loaders,
  categories,
  signal,
}: SearchProjectsParams): Promise<SearchProjectsResult> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ProjectsQueryData,
    ProjectsQueryVariables
  >({
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
    loaders: data.platformMetadata.loaders,
    versions: data.platformMetadata.gameVersions,
  };
}

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

export async function fetchViewerFollowedProjects(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<ViewerFollowedProjectsResult> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ViewerFollowedProjectsQueryData,
    ViewerFollowedProjectsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_FOLLOWED_PROJECTS_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  throwIfAborted(signal);

  return {
    projects: data.viewerFollowedProjectSearch.projects.map(projectFromSummary),
    totalHits: data.viewerFollowedProjectSearch.totalHits,
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

export async function fetchProjectDetails(
  slug: string,
  signal?: AbortSignal,
): Promise<ProjectDetails> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ProjectBySlugQueryData,
    ProjectBySlugQueryVariables
  >({
    fetchPolicy: 'network-only',
    query: PROJECT_BY_SLUG_QUERY,
    variables: { slug },
  });

  throwIfAborted(signal);

  if (data.projectBySlug === null) {
    throw new Error('Project not found');
  }

  return projectDetailsFromSummary(data.projectBySlug);
}

export async function fetchProjectVersions(
  slug: string,
  signal?: AbortSignal,
): Promise<ProjectVersion[]> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    VersionsForProjectQueryData,
    VersionsForProjectQueryVariables
  >({
    fetchPolicy: 'network-only',
    query: VERSIONS_FOR_PROJECT_QUERY,
    variables: { projectSlug: slug },
  });

  throwIfAborted(signal);

  return data.versionsForProject.map(versionFromSummary);
}

export async function fetchProjectVersionSearch(
  slug: string,
  {
    gameVersion,
    limit = 20,
    loader,
    page = 1,
    search,
  }: {
    gameVersion?: string | null;
    limit?: number;
    loader?: string | null;
    page?: number;
    search?: string | null;
  } = {},
  signal?: AbortSignal,
): Promise<ProjectVersionSearchResult> {
  throwIfAborted(signal);

  const normalizedSearch = search?.trim() ?? '';
  const { data } = await apolloClient.query<
    VersionSearchForProjectQueryData,
    VersionSearchForProjectQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VERSION_SEARCH_FOR_PROJECT_QUERY,
    variables: {
      gameVersion,
      limit,
      loader,
      offset: Math.max(0, page - 1) * limit,
      projectSlug: slug,
      search: normalizedSearch === '' ? null : normalizedSearch,
    },
  });

  throwIfAborted(signal);

  return {
    totalHits: data.versionSearchForProject.totalHits,
    versions: data.versionSearchForProject.versions.map(versionFromSummary),
  };
}

export async function fetchProjectMembers(
  slug: string,
  signal?: AbortSignal,
): Promise<ProjectMember[]> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ProjectMembersQueryData,
    ProjectMembersQueryVariables
  >({
    fetchPolicy: 'network-only',
    query: PROJECT_MEMBERS_QUERY,
    variables: { projectSlug: slug },
  });

  throwIfAborted(signal);

  return data.projectMembers.map(memberFromSummary);
}

export async function fetchProjectMemberSearch(
  slug: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<ProjectMemberSearchResult> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ProjectMemberSearchQueryData,
    ProjectMemberSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PROJECT_MEMBER_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      projectSlug: slug,
    },
  });

  throwIfAborted(signal);

  return {
    members: data.projectMemberSearch.members.map(memberFromSummary),
    totalHits: data.projectMemberSearch.totalHits,
  };
}

export async function fetchProjectAnalytics(
  slug: string,
  signal?: AbortSignal,
): Promise<ProjectAnalytics | null> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ProjectAnalyticsQueryData,
    ProjectAnalyticsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PROJECT_ANALYTICS_QUERY,
    variables: { projectSlug: slug },
  });

  throwIfAborted(signal);

  return data.projectAnalytics;
}

export async function fetchViewerProjectFollowState(
  slug: string,
  signal?: AbortSignal,
): Promise<ProjectFollowState | null> {
  if (!hasAuthToken()) return null;
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ProjectFollowStateQueryData,
    ProjectMembersQueryVariables
  >({
    fetchPolicy: 'network-only',
    query: VIEWER_PROJECT_FOLLOW_STATE_QUERY,
    variables: { projectSlug: slug },
  });

  throwIfAborted(signal);

  return data.viewerProjectFollowState;
}

export async function setProjectFollowing(
  slug: string,
  following: boolean,
): Promise<ProjectFollowState> {
  const { data } = await apolloClient.mutate<
    ProjectFollowStateMutationData,
    ProjectMembersQueryVariables
  >({
    mutation: following ? FOLLOW_PROJECT_MUTATION : UNFOLLOW_PROJECT_MUTATION,
    variables: { projectSlug: slug },
  });
  const state = following ? data?.followProject : data?.unfollowProject;

  if (state === undefined) {
    throw new Error('Follow state did not return from the API');
  }

  return state;
}

export async function recordDownload(fileId: string): Promise<void> {
  const { data } = await apolloClient.mutate<
    RecordDownloadMutationData,
    RecordDownloadMutationVariables
  >({
    mutation: RECORD_DOWNLOAD_MUTATION,
    variables: { input: { fileId } },
  });

  if (!data?.recordDownload) {
    throw new Error('Download record did not return from the API');
  }
}

export async function recordProjectView(projectSlug: string): Promise<void> {
  const { data } = await apolloClient.mutate<
    RecordProjectViewMutationData,
    RecordProjectViewMutationVariables
  >({
    mutation: RECORD_PROJECT_VIEW_MUTATION,
    variables: { input: { projectSlug } },
  });

  if (!data?.recordProjectView) {
    throw new Error('Project view record did not return from the API');
  }
}

export async function createProjectReport(input: {
  body: string;
  projectSlug: string;
  reason: ReportReason;
}): Promise<ReportSummary> {
  const { data } = await apolloClient.mutate<
    CreateProjectReportMutationData,
    CreateProjectReportMutationVariables
  >({
    mutation: CREATE_PROJECT_REPORT_MUTATION,
    variables: { input },
  });

  if (data === null || data === undefined) {
    throw new Error('Report did not return from the API');
  }

  return data.createProjectReport;
}

export async function createVersionReport(input: {
  body: string;
  reason: ReportReason;
  versionId: string;
}): Promise<ReportSummary> {
  const { data } = await apolloClient.mutate<
    CreateVersionReportMutationData,
    CreateVersionReportMutationVariables
  >({
    mutation: CREATE_VERSION_REPORT_MUTATION,
    variables: { input },
  });

  if (data === null || data === undefined) {
    throw new Error('Report did not return from the API');
  }

  return data.createVersionReport;
}

export function hasAuthToken(): boolean {
  return localStorage.getItem(authTokenStorageKey) !== null;
}

function sortToApiSort(sort: SortKey): string {
  if (sort === 'downloads') return 'downloads';
  if (sort === 'updated') return 'updated';
  if (sort === 'name') return 'name';
  return 'relevance';
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) {
    throw new DOMException('Request aborted', 'AbortError');
  }
}
