import { apolloClient } from '../../../apollo.js';
import {
  memberFromSummary,
  projectDetailsFromSummary,
  versionFromSummary,
} from '../mappers.js';
import {
  PROJECT_ANALYTICS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECT_MEMBER_SEARCH_QUERY,
  PROJECT_MEMBERS_QUERY,
  VERSION_SEARCH_FOR_PROJECT_QUERY,
  VERSIONS_FOR_PROJECT_QUERY,
} from '../queries.js';
import {
  type ProjectAnalytics,
  type ProjectAnalyticsQueryData,
  type ProjectAnalyticsQueryVariables,
  type ProjectBySlugQueryData,
  type ProjectBySlugQueryVariables,
  type ProjectDetails,
  type ProjectMember,
  type ProjectMemberSearchQueryData,
  type ProjectMemberSearchQueryVariables,
  type ProjectMemberSearchResult,
  type ProjectMembersQueryData,
  type ProjectMembersQueryVariables,
  type ProjectVersion,
  type ProjectVersionSearchResult,
  type VersionSearchForProjectQueryData,
  type VersionSearchForProjectQueryVariables,
  type VersionsForProjectQueryData,
  type VersionsForProjectQueryVariables,
} from '../types.js';
import { throwIfAborted } from './runtime.js';

export async function fetchProjectDetails(
  slug: string,
  signal?: AbortSignal,
): Promise<ProjectDetails> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    ProjectBySlugQueryData,
    ProjectBySlugQueryVariables
  >({
    context: { fetchOptions: { signal } },
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
    context: { fetchOptions: { signal } },
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
    context: { fetchOptions: { signal } },
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
