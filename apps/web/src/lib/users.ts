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

interface UserByUsernameQueryData {
  userByUsername: PublicUserProfile | null;
}

interface PublicUsersQueryData {
  publicUsers: PublicUserListItem[];
}

interface PublicUsersQueryVariables {
  search?: string | null;
}

interface UserByUsernameQueryVariables {
  username: string;
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
  viewerBlockedUsers?: FriendshipSummary[];
  viewerFriendRequests?: FriendshipSummary[];
  viewerFriends?: FriendshipSummary[];
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
  query PublicUsers($search: String) {
    publicUsers(search: $search) {
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

const VIEWER_FRIEND_REQUESTS_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriendRequests {
    viewerFriendRequests {
      ...FriendshipSummaryFields
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
  signal?: AbortSignal,
): Promise<PublicUserListItem[]> {
  const normalizedSearch = search?.trim() ?? '';
  const { data } = await apolloClient.query<
    PublicUsersQueryData,
    PublicUsersQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_USERS_QUERY,
    variables: {
      search: normalizedSearch === '' ? null : normalizedSearch,
    },
  });

  return data.publicUsers;
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

  return data.viewerFriends ?? [];
}

export async function fetchViewerFriendRequests(): Promise<
  FriendshipSummary[]
> {
  const { data } = await apolloClient.query<ViewerFriendshipsQueryData>({
    fetchPolicy: 'network-only',
    query: VIEWER_FRIEND_REQUESTS_QUERY,
  });

  return data.viewerFriendRequests ?? [];
}

export async function fetchViewerBlockedUsers(): Promise<FriendshipSummary[]> {
  const { data } = await apolloClient.query<ViewerFriendshipsQueryData>({
    fetchPolicy: 'network-only',
    query: VIEWER_BLOCKED_USERS_QUERY,
  });

  return data.viewerBlockedUsers ?? [];
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
