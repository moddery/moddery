import { type ReportReason } from '@moddery/shared';

import { apolloClient, authTokenStorageKey } from '../apollo.js';
import { type Mod, type ProjectType } from '../types.js';
import {
  collectionFromSummary,
  memberFromSummary,
  projectDetailsFromSummary,
  projectFromSummary,
  projectSearchTags,
  sortByName,
  versionFromSummary,
} from './catalog/mappers.js';
import { projectKindFromType } from './projectTypes.js';
import {
  CREATE_PROJECT_REPORT_MUTATION,
  CREATE_VERSION_REPORT_MUTATION,
  ADD_PROJECT_TO_COLLECTION_MUTATION,
  FOLLOW_PROJECT_MUTATION,
  PLATFORM_METADATA_QUERY,
  PROJECTS_QUERY,
  PROJECT_ANALYTICS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECT_MEMBERS_QUERY,
  PUBLIC_COLLECTION_BY_SLUG_QUERY,
  PUBLIC_COLLECTIONS_QUERY,
  RECORD_DOWNLOAD_MUTATION,
  RECORD_PROJECT_VIEW_MUTATION,
  REMOVE_PROJECT_FROM_COLLECTION_MUTATION,
  UNFOLLOW_PROJECT_MUTATION,
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
  type ProjectMembersQueryData,
  type ProjectMembersQueryVariables,
  type ProjectsQueryData,
  type ProjectsQueryVariables,
  type ProjectVersion,
  type PublicCollection,
  type PublicCollectionBySlugQueryData,
  type PublicCollectionBySlugQueryVariables,
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
  type VersionsForProjectQueryData,
  type VersionsForProjectQueryVariables,
  type ViewerFollowedProjectsQueryData,
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
  ProjectVersion,
  PublicCollection,
  PublicCollectionItem,
  ReportSummary,
  SearchProjectsParams,
  SearchProjectsResult,
  SortKey,
  VersionDependency,
  ViewerCollectionChoice,
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

  const filtered = data.projects.map(projectFromSummary);
  const sorted = sort === 'name' ? sortByName(filtered) : filtered;
  const offset = Math.max(0, page - 1) * limit;

  return {
    projects: sorted.slice(offset, offset + limit),
    totalHits: sorted.length,
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
  signal?: AbortSignal,
): Promise<PublicCollection[]> {
  throwIfAborted(signal);

  const normalizedSearch = search?.trim() ?? '';
  const { data } = await apolloClient.query<
    PublicCollectionsQueryData,
    PublicCollectionsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_COLLECTIONS_QUERY,
    variables: {
      search: normalizedSearch === '' ? null : normalizedSearch,
    },
  });

  throwIfAborted(signal);

  return data.publicCollections.map(collectionFromSummary);
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

export async function fetchViewerFollowedProjects(
  signal?: AbortSignal,
): Promise<Mod[]> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<ViewerFollowedProjectsQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_FOLLOWED_PROJECTS_QUERY,
  });

  throwIfAborted(signal);

  return data.viewerFollowedProjects.map(projectFromSummary);
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

export async function fetchProjectAnalytics(
  slug: string,
  signal?: AbortSignal,
): Promise<ProjectAnalytics | null> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ProjectAnalyticsQueryData,
    ProjectAnalyticsQueryVariables
  >({
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
  return 'relevance';
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) {
    throw new DOMException('Request aborted', 'AbortError');
  }
}
