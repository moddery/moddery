import { gql } from '@apollo/client';
import { type ProjectKind } from '@moddery/shared';

import { apolloClient } from '../apollo.js';
import { type Mod } from '../types.js';
import { projectTypeFromKind } from './projectTypes.js';

export interface OrganizationProfile {
  color: string | null;
  createdAt: string;
  description: string | null;
  iconUrl: string | null;
  id: string;
  memberCount: number;
  members: OrganizationMember[];
  name: string;
  owner: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
  projectCount: number;
  projects: OrganizationProjectPreview[];
  slug: string;
  updatedAt: string;
}

export interface OrganizationMember {
  isOwner: boolean;
  permissions: string[];
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface OrganizationProjectPreview {
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
  slug: string;
  summary: string;
  title: string;
  updatedAt: string;
}

interface OrganizationBySlugQueryData {
  organizationBySlug: OrganizationProfile | null;
}

interface PublicOrganizationsQueryData {
  publicOrganizations: OrganizationProfile[];
}

interface OrganizationBySlugQueryVariables {
  slug: string;
}

const ORGANIZATION_BY_SLUG_QUERY = gql`
  query OrganizationBySlug($slug: String!) {
    organizationBySlug(slug: $slug) {
      color
      createdAt
      description
      iconUrl
      id
      memberCount
      members {
        isOwner
        permissions
        role
        sortOrder
        user {
          avatarUrl
          displayName
          id
          username
        }
      }
      name
      owner {
        avatarUrl
        displayName
        id
        username
      }
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
        slug
        summary
        title
        updatedAt
      }
      slug
      updatedAt
    }
  }
`;

const PUBLIC_ORGANIZATIONS_QUERY = gql`
  query PublicOrganizations {
    publicOrganizations {
      color
      createdAt
      description
      iconUrl
      id
      memberCount
      members {
        isOwner
        permissions
        role
        sortOrder
        user {
          avatarUrl
          displayName
          id
          username
        }
      }
      name
      owner {
        avatarUrl
        displayName
        id
        username
      }
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
        slug
        summary
        title
        updatedAt
      }
      slug
      updatedAt
    }
  }
`;

export async function fetchPublicOrganizations(
  signal?: AbortSignal,
): Promise<OrganizationProfile[]> {
  const { data } = await apolloClient.query<PublicOrganizationsQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_ORGANIZATIONS_QUERY,
  });

  return data.publicOrganizations;
}

export async function fetchOrganizationProfile(
  slug: string,
  signal?: AbortSignal,
): Promise<OrganizationProfile | null> {
  const { data } = await apolloClient.query<
    OrganizationBySlugQueryData,
    OrganizationBySlugQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: ORGANIZATION_BY_SLUG_QUERY,
    variables: { slug },
  });

  return data.organizationBySlug;
}

export function organizationProjectToMod(
  project: OrganizationProjectPreview,
): Mod {
  return {
    author:
      project.owner?.displayName ?? project.owner?.username ?? 'Unknown user',
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
    projectType: projectTypeFromKind(project.kind),
    server: 'optional',
    slug: project.slug,
    title: project.title,
    updated: project.updatedAt,
  };
}
