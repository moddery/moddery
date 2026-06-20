import { apolloClient } from '../../../apollo.js';
import { projectFromSummary } from '../mappers.js';
import {
  FOLLOW_PROJECT_MUTATION,
  RECORD_DOWNLOAD_MUTATION,
  RECORD_PROJECT_VIEW_MUTATION,
  UNFOLLOW_PROJECT_MUTATION,
  VIEWER_FOLLOWED_PROJECTS_QUERY,
  VIEWER_PROJECT_FOLLOW_STATE_QUERY,
} from '../queries.js';
import {
  type ProjectFollowState,
  type ProjectFollowStateMutationData,
  type ProjectFollowStateQueryData,
  type ProjectMembersQueryVariables,
  type DownloadRecord,
  type ProjectViewRecord,
  type RecordDownloadMutationData,
  type RecordDownloadMutationVariables,
  type RecordProjectViewMutationData,
  type RecordProjectViewMutationVariables,
  type ViewerFollowedProjectsQueryData,
  type ViewerFollowedProjectsQueryVariables,
  type ViewerFollowedProjectsResult,
} from '../types.js';
import { hasAuthToken, throwIfAborted } from './runtime.js';

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
    context: { fetchOptions: { signal } },
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

export async function recordDownload(fileId: string): Promise<DownloadRecord> {
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

  return data.recordDownload;
}

export async function recordProjectView(
  projectSlug: string,
): Promise<ProjectViewRecord> {
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

  return data.recordProjectView;
}
