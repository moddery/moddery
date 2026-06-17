import { gql } from '@apollo/client';
import { type ProjectKind, type ReportReason } from '@moddery/shared';

import { apolloClient, authTokenStorageKey } from '../apollo.js';
import { type Mod } from '../types.js';
import { projectTypeFromKind } from './projectTypes.js';

export interface PublicUserProfile {
  avatarUrl: string | null;
  bio: string | null;
  collectionCount: number;
  collections: UserCollectionPreview[];
  createdAt: string;
  displayName: string | null;
  followedProjectCount: number;
  friendCount: number;
  id: string;
  isAdmin: boolean;
  projectCount: number;
  projects: UserProjectPreview[];
  role: string;
  username: string;
}

export interface PublicUserListItem {
  avatarUrl: string | null;
  bio: string | null;
  collectionCount: number;
  createdAt: string;
  displayName: string | null;
  friendCount: number;
  id: string;
  isAdmin: boolean;
  projectCount: number;
  projects: UserProjectPreview[];
  username: string;
}

export interface UserCollectionPreview {
  color: string | null;
  description: string | null;
  id: string;
  name: string;
  projectCount: number;
  projects: UserProjectPreview[];
  slug: string;
  updatedAt: string;
}

export interface UserProjectPreview {
  categories: string[];
  color: string | null;
  downloads: number;
  followers: number;
  gameVersions: string[];
  iconUrl: string | null;
  kind: ProjectKind;
  loaders: string[];
  owner?: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  organization?: {
    color: string | null;
    iconUrl: string | null;
    id: string;
    name: string;
    slug: string;
  } | null;
  slug: string;
  summary: string;
  title: string;
  updatedAt: string;
}

export interface UserReportSummary {
  body: string;
  closedAt: string | null;
  createdAt: string;
  id: string;
  projectId: string | null;
  reason: ReportReason;
  state: string;
  userTargetId: string | null;
  versionId: string | null;
}

export interface FriendshipSummary {
  acceptedAt: string | null;
  createdAt: string;
  direction: 'INCOMING' | 'OUTGOING' | 'MUTUAL';
  id: string;
  state: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface FriendshipSearchResult {
  friendships: FriendshipSummary[];
  totalHits: number;
}

interface UserByUsernameQueryData {
  userByUsername: PublicUserProfile | null;
}

export interface PublicUsersResult {
  totalHits: number;
  users: PublicUserListItem[];
}

export interface PublicUserProjectsResult {
  projects: UserProjectPreview[];
  totalHits: number;
}

export interface PublicUserCollectionsResult {
  collections: UserCollectionPreview[];
  totalHits: number;
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

const USER_PROJECT_PREVIEW_FRAGMENT = gql`
  fragment UserProjectPreviewFields on ProjectSummary {
    categories
    color
    downloads
    followers
    gameVersions
    iconUrl
    kind
    loaders
    organization {
      color
      iconUrl
      id
      name
      slug
    }
    owner {
      avatarUrl
      displayName
      id
      username
    }
    slug
    summary
    title
    updatedAt
  }
`;

const FRIENDSHIP_SUMMARY_FRAGMENT = gql`
  fragment FriendshipSummaryFields on FriendshipSummary {
    acceptedAt
    createdAt
    direction
    id
    state
    user {
      avatarUrl
      displayName
      id
      username
    }
  }
`;

const USER_BY_USERNAME_QUERY = gql`
  ${USER_PROJECT_PREVIEW_FRAGMENT}
  query UserByUsername($username: String!) {
    userByUsername(username: $username) {
      avatarUrl
      bio
      collectionCount
      collections {
        color
        description
        id
        name
        projectCount
        projects {
          ...UserProjectPreviewFields
        }
        slug
        updatedAt
      }
      createdAt
      displayName
      followedProjectCount
      friendCount
      id
      isAdmin
      projectCount
      projects {
        ...UserProjectPreviewFields
      }
      role
      username
    }
  }
`;

const PUBLIC_USERS_QUERY = gql`
  ${USER_PROJECT_PREVIEW_FRAGMENT}
  query PublicUsers($search: String, $limit: Int!, $offset: Int!) {
    publicUserSearch(search: $search, limit: $limit, offset: $offset) {
      totalHits
      users {
        avatarUrl
        bio
        collectionCount
        createdAt
        displayName
        friendCount
        id
        isAdmin
        projectCount
        projects {
          ...UserProjectPreviewFields
        }
        username
      }
    }
  }
`;

const PUBLIC_USER_PROJECTS_QUERY = gql`
  ${USER_PROJECT_PREVIEW_FRAGMENT}
  query PublicUserProjects($username: String!, $limit: Int!, $offset: Int!) {
    publicUserProjectSearch(
      username: $username
      limit: $limit
      offset: $offset
    ) {
      projects {
        ...UserProjectPreviewFields
      }
      totalHits
    }
  }
`;

const PUBLIC_USER_COLLECTIONS_QUERY = gql`
  ${USER_PROJECT_PREVIEW_FRAGMENT}
  query PublicUserCollections($username: String!, $limit: Int!, $offset: Int!) {
    publicUserCollectionSearch(
      username: $username
      limit: $limit
      offset: $offset
    ) {
      collections {
        color
        description
        id
        name
        projectCount
        projects {
          ...UserProjectPreviewFields
        }
        slug
        updatedAt
      }
      totalHits
    }
  }
`;

const VIEWER_FRIENDSHIP_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriendship($username: String!) {
    viewer {
      username
    }
    viewerFriendship(username: $username) {
      ...FriendshipSummaryFields
    }
  }
`;

const SEND_FRIEND_REQUEST_MUTATION = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  mutation SendFriendRequest($username: String!) {
    sendFriendRequest(username: $username) {
      ...FriendshipSummaryFields
    }
  }
`;

const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  mutation AcceptFriendRequest($username: String!) {
    acceptFriendRequest(username: $username) {
      ...FriendshipSummaryFields
    }
  }
`;

const VIEWER_FRIENDS_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriends {
    viewerFriends {
      ...FriendshipSummaryFields
    }
  }
`;

const VIEWER_FRIEND_SEARCH_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriendSearch($limit: Int!, $offset: Int!) {
    viewerFriendSearch(limit: $limit, offset: $offset) {
      friendships {
        ...FriendshipSummaryFields
      }
      totalHits
    }
  }
`;

const VIEWER_FRIEND_REQUESTS_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriendRequests {
    viewerFriendRequests {
      ...FriendshipSummaryFields
    }
  }
`;

const VIEWER_FRIEND_REQUEST_SEARCH_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriendRequestSearch($limit: Int!, $offset: Int!) {
    viewerFriendRequestSearch(limit: $limit, offset: $offset) {
      friendships {
        ...FriendshipSummaryFields
      }
      totalHits
    }
  }
`;

const VIEWER_BLOCKED_USERS_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerBlockedUsers {
    viewerBlockedUsers {
      ...FriendshipSummaryFields
    }
  }
`;

const VIEWER_BLOCKED_USER_SEARCH_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerBlockedUserSearch($limit: Int!, $offset: Int!) {
    viewerBlockedUserSearch(limit: $limit, offset: $offset) {
      friendships {
        ...FriendshipSummaryFields
      }
      totalHits
    }
  }
`;

const REMOVE_FRIEND_MUTATION = gql`
  mutation RemoveFriend($username: String!) {
    removeFriend(username: $username)
  }
`;

const BLOCK_USER_MUTATION = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  mutation BlockUser($username: String!) {
    blockUser(username: $username) {
      ...FriendshipSummaryFields
    }
  }
`;

const CREATE_USER_REPORT_MUTATION = gql`
  mutation CreateUserReport($input: CreateUserReportInput!) {
    createUserReport(input: $input) {
      body
      closedAt
      createdAt
      id
      projectId
      reason
      state
      userTargetId
      versionId
    }
  }
`;

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

export function hasAuthToken(): boolean {
  return localStorage.getItem(authTokenStorageKey) !== null;
}

export function userProjectToMod(project: UserProjectPreview): Mod {
  const organizationName = project.organization?.name.trim() ?? '';
  const ownerName =
    project.owner?.displayName ?? project.owner?.username ?? 'Unknown user';

  return {
    author: organizationName || ownerName,
    authorUsername: project.owner?.username ?? null,
    categories: project.categories,
    client: 'optional',
    color: project.color,
    description: project.summary,
    downloads: project.downloads,
    follows: project.followers,
    gameVersions: project.gameVersions,
    icon: project.iconUrl,
    loaders: project.loaders.map((loader) => loader.toLowerCase()),
    organization: project.organization ?? null,
    projectType: projectTypeFromKind(project.kind),
    server: 'optional',
    slug: project.slug,
    title: project.title,
    updated: project.updatedAt,
  };
}
