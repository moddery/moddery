import { gql } from '@apollo/client';
import { type ProjectKind, type ReportReason } from '@moddery/shared';

import { apolloClient } from '../apollo.js';
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
  id: string;
  isAdmin: boolean;
  projectCount: number;
  projects: UserProjectPreview[];
  role: string;
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

interface UserByUsernameQueryData {
  userByUsername: PublicUserProfile | null;
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

const USER_BY_USERNAME_QUERY = gql`
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
          categories
          color
          downloads
          followers
          gameVersions
          iconUrl
          kind
          loaders
          owner {
            avatarUrl
            displayName
            id
            username
          }
          organization {
            color
            iconUrl
            id
            name
            slug
          }
          slug
          summary
          title
          updatedAt
        }
        slug
        updatedAt
      }
      createdAt
      displayName
      followedProjectCount
      id
      isAdmin
      projectCount
      projects {
        categories
        color
        downloads
        followers
        gameVersions
        iconUrl
        kind
        loaders
        owner {
          avatarUrl
          displayName
          id
          username
        }
        organization {
          color
          iconUrl
          id
          name
          slug
        }
        slug
        summary
        title
        updatedAt
      }
      role
      username
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
