import { type ReportReason } from '@moddery/shared';

import { apolloClient } from '../../apollo.js';
import {
  ACCEPT_FRIEND_REQUEST_MUTATION,
  BLOCK_USER_MUTATION,
  CREATE_USER_DIRECT_THREAD_MUTATION,
  CREATE_USER_REPORT_MUTATION,
  PUBLIC_USER_COLLECTIONS_QUERY,
  PUBLIC_USER_PROJECTS_QUERY,
  PUBLIC_USERS_QUERY,
  REMOVE_FRIEND_MUTATION,
  SEND_FRIEND_REQUEST_MUTATION,
  USER_BY_USERNAME_QUERY,
  VIEWER_BLOCKED_USER_SEARCH_QUERY,
  VIEWER_BLOCKED_USERS_QUERY,
  VIEWER_FRIEND_REQUEST_SEARCH_QUERY,
  VIEWER_FRIEND_REQUESTS_QUERY,
  VIEWER_FRIEND_SEARCH_QUERY,
  VIEWER_FRIENDS_QUERY,
  VIEWER_FRIENDSHIP_QUERY,
} from './graphql.js';
import {
  type FriendshipSearchResult,
  type FriendshipSummary,
  type PublicUserCollectionsResult,
  type PublicUserListItem,
  type PublicUserProfile,
  type PublicUserProjectsResult,
  type PublicUsersResult,
  type UserCollectionPreview,
  type UserProjectPreview,
  type UserReportSummary,
} from './types.js';

interface UserByUsernameQueryData {
  userByUsername: PublicUserProfile | null;
}

interface PublicUsersQueryData {
  publicUserSearch: PublicUsersResult;
}

interface PublicUserProjectsQueryData {
  publicUserProjectSearch: PublicUserProjectsResult;
}

interface PublicUserCollectionsQueryData {
  publicUserCollectionSearch: PublicUserCollectionsResult;
}

interface PublicUsersQueryVariables {
  limit: number;
  offset: number;
  search?: string | null;
}

interface UserByUsernameQueryVariables {
  username: string;
}

interface PublicUserListQueryVariables extends UserByUsernameQueryVariables {
  limit: number;
  offset: number;
}

interface CreateUserReportMutationData {
  createUserReport: UserReportSummary;
}

interface CreateUserReportMutationVariables {
  input: {
    body: string;
    reason: ReportReason;
    username: string;
  };
}

interface CreateUserDirectThreadMutationData {
  createDirectThread: {
    id: string;
  };
}

interface CreateUserDirectThreadMutationVariables {
  input: {
    body: string;
    username: string;
  };
}

interface ViewerFriendshipQueryData {
  viewer: { username: string } | null;
  viewerFriendship: FriendshipSummary | null;
}

interface ViewerFriendshipsQueryData {
  viewerBlockedUsers: FriendshipSummary[];
  viewerFriendRequests: FriendshipSummary[];
  viewerFriends: FriendshipSummary[];
}

interface ViewerFriendSearchQueryData {
  viewerFriendSearch: FriendshipSearchResult;
}

interface ViewerFriendRequestSearchQueryData {
  viewerFriendRequestSearch: FriendshipSearchResult;
}

interface ViewerBlockedUserSearchQueryData {
  viewerBlockedUserSearch: FriendshipSearchResult;
}

interface ViewerFriendshipSearchQueryVariables {
  limit: number;
  offset: number;
}

interface ViewerFriendshipQueryVariables {
  username: string;
}

interface FriendshipMutationData {
  blockUser?: FriendshipSummary;
  acceptFriendRequest?: FriendshipSummary;
  sendFriendRequest?: FriendshipSummary;
}

interface FriendshipMutationVariables {
  username: string;
}

interface RemoveFriendMutationData {
  removeFriend: boolean;
}

export async function fetchUserProfile(
  username: string,
  signal?: AbortSignal,
): Promise<PublicUserProfile | null> {
  const { data } = await apolloClient.query<
    UserByUsernameQueryData,
    UserByUsernameQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: USER_BY_USERNAME_QUERY,
    variables: { username },
  });

  return data.userByUsername;
}

export async function fetchPublicUsers(
  search?: string | null,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<PublicUsersResult> {
  const normalizedSearch = search?.trim() ?? '';
  const offset = Math.max(0, page - 1) * limit;
  const { data } = await apolloClient.query<
    PublicUsersQueryData,
    PublicUsersQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_USERS_QUERY,
    variables: {
      limit,
      offset,
      search: normalizedSearch === '' ? null : normalizedSearch,
    },
  });

  return data.publicUserSearch;
}

export async function fetchPublicUserProjects(
  username: string,
  page = 1,
  limit = 12,
  signal?: AbortSignal,
): Promise<PublicUserProjectsResult> {
  const { data } = await apolloClient.query<
    PublicUserProjectsQueryData,
    PublicUserListQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_USER_PROJECTS_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      username,
    },
  });

  return data.publicUserProjectSearch;
}

export async function fetchPublicUserCollections(
  username: string,
  page = 1,
  limit = 10,
  signal?: AbortSignal,
): Promise<PublicUserCollectionsResult> {
  const { data } = await apolloClient.query<
    PublicUserCollectionsQueryData,
    PublicUserListQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_USER_COLLECTIONS_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      username,
    },
  });

  return data.publicUserCollectionSearch;
}

export async function createUserReport(input: {
  body: string;
  reason: ReportReason;
  username: string;
}): Promise<UserReportSummary> {
  const { data } = await apolloClient.mutate<
    CreateUserReportMutationData,
    CreateUserReportMutationVariables
  >({
    mutation: CREATE_USER_REPORT_MUTATION,
    variables: { input },
  });

  if (data === null || data === undefined) {
    throw new Error('Report did not return from the API');
  }

  return data.createUserReport;
}

export async function createUserDirectThread(input: {
  body: string;
  username: string;
}): Promise<string> {
  const { data } = await apolloClient.mutate<
    CreateUserDirectThreadMutationData,
    CreateUserDirectThreadMutationVariables
  >({
    mutation: CREATE_USER_DIRECT_THREAD_MUTATION,
    variables: { input },
  });

  if (data?.createDirectThread === undefined) {
    throw new Error('Direct thread did not return from the API');
  }

  return data.createDirectThread.id;
}

export async function fetchViewerFriendship(username: string): Promise<{
  friendship: FriendshipSummary | null;
  viewerUsername: string | null;
}> {
  const { data } = await apolloClient.query<
    ViewerFriendshipQueryData,
    ViewerFriendshipQueryVariables
  >({
    fetchPolicy: 'network-only',
    query: VIEWER_FRIENDSHIP_QUERY,
    variables: { username },
  });

  return {
    friendship: data.viewerFriendship,
    viewerUsername: data.viewer?.username ?? null,
  };
}

export async function fetchViewerFriends(): Promise<FriendshipSummary[]> {
  const { data } = await apolloClient.query<ViewerFriendshipsQueryData>({
    fetchPolicy: 'network-only',
    query: VIEWER_FRIENDS_QUERY,
  });

  return data.viewerFriends;
}

export async function fetchViewerFriendSearch(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<FriendshipSearchResult> {
  const offset = Math.max(0, page - 1) * limit;
  const { data } = await apolloClient.query<
    ViewerFriendSearchQueryData,
    ViewerFriendshipSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_FRIEND_SEARCH_QUERY,
    variables: { limit, offset },
  });

  return data.viewerFriendSearch;
}

export async function fetchViewerFriendRequests(): Promise<
  FriendshipSummary[]
> {
  const { data } = await apolloClient.query<ViewerFriendshipsQueryData>({
    fetchPolicy: 'network-only',
    query: VIEWER_FRIEND_REQUESTS_QUERY,
  });

  return data.viewerFriendRequests;
}

export async function fetchViewerFriendRequestSearch(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<FriendshipSearchResult> {
  const offset = Math.max(0, page - 1) * limit;
  const { data } = await apolloClient.query<
    ViewerFriendRequestSearchQueryData,
    ViewerFriendshipSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_FRIEND_REQUEST_SEARCH_QUERY,
    variables: { limit, offset },
  });

  return data.viewerFriendRequestSearch;
}

export async function fetchViewerBlockedUsers(): Promise<FriendshipSummary[]> {
  const { data } = await apolloClient.query<ViewerFriendshipsQueryData>({
    fetchPolicy: 'network-only',
    query: VIEWER_BLOCKED_USERS_QUERY,
  });

  return data.viewerBlockedUsers;
}

export async function fetchViewerBlockedUserSearch(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<FriendshipSearchResult> {
  const offset = Math.max(0, page - 1) * limit;
  const { data } = await apolloClient.query<
    ViewerBlockedUserSearchQueryData,
    ViewerFriendshipSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_BLOCKED_USER_SEARCH_QUERY,
    variables: { limit, offset },
  });

  return data.viewerBlockedUserSearch;
}

export async function sendFriendRequest(
  username: string,
): Promise<FriendshipSummary> {
  const { data } = await apolloClient.mutate<
    FriendshipMutationData,
    FriendshipMutationVariables
  >({
    mutation: SEND_FRIEND_REQUEST_MUTATION,
    variables: { username },
  });

  if (!data?.sendFriendRequest) {
    throw new Error('Friend request did not return from the API');
  }

  return data.sendFriendRequest;
}

export async function acceptFriendRequest(
  username: string,
): Promise<FriendshipSummary> {
  const { data } = await apolloClient.mutate<
    FriendshipMutationData,
    FriendshipMutationVariables
  >({
    mutation: ACCEPT_FRIEND_REQUEST_MUTATION,
    variables: { username },
  });

  if (!data?.acceptFriendRequest) {
    throw new Error('Friend request acceptance did not return from the API');
  }

  return data.acceptFriendRequest;
}

export async function removeFriend(username: string): Promise<void> {
  const { data } = await apolloClient.mutate<
    RemoveFriendMutationData,
    FriendshipMutationVariables
  >({
    mutation: REMOVE_FRIEND_MUTATION,
    variables: { username },
  });

  if (data?.removeFriend !== true) {
    throw new Error('Friend removal did not return from the API');
  }
}

export async function blockUser(username: string): Promise<FriendshipSummary> {
  const { data } = await apolloClient.mutate<
    FriendshipMutationData,
    FriendshipMutationVariables
  >({
    mutation: BLOCK_USER_MUTATION,
    variables: { username },
  });

  if (!data?.blockUser) {
    throw new Error('Block did not return from the API');
  }

  return data.blockUser;
}

export type {
  PublicUserCollectionsResult,
  PublicUserListItem,
  PublicUserProjectsResult,
  PublicUsersResult,
  UserCollectionPreview,
  UserProjectPreview,
};
