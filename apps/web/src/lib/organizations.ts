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

interface PublicOrganizationsQueryVariables {
  search?: string | null;
}

interface OrganizationBySlugQueryVariables {
  slug: string;
}

const ORGANIZATION_PROJECT_PREVIEW_FRAGMENT = gql`
  fragment OrganizationProjectPreviewFields on ProjectSummary {
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
`;

const ORGANIZATION_PROFILE_FRAGMENT = gql`
  ${ORGANIZATION_PROJECT_PREVIEW_FRAGMENT}
  fragment OrganizationProfileFields on OrganizationSummary {
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
      ...OrganizationProjectPreviewFields
    }
    slug
    updatedAt
  }
`;

const ORGANIZATION_BY_SLUG_QUERY = gql`
  ${ORGANIZATION_PROFILE_FRAGMENT}
  query OrganizationBySlug($slug: String!) {
    organizationBySlug(slug: $slug) {
      ...OrganizationProfileFields
    }
  }
`;

const PUBLIC_ORGANIZATIONS_QUERY = gql`
  ${ORGANIZATION_PROFILE_FRAGMENT}
  query PublicOrganizations($search: String) {
    publicOrganizations(search: $search) {
      ...OrganizationProfileFields
    }
  }
`;

export async function fetchPublicOrganizations(
  search?: string | null,
  signal?: AbortSignal,
): Promise<OrganizationProfile[]> {
  const normalizedSearch = search?.trim() ?? '';
  const { data } = await apolloClient.query<
    PublicOrganizationsQueryData,
    PublicOrganizationsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_ORGANIZATIONS_QUERY,
    variables: {
      search: normalizedSearch === '' ? null : normalizedSearch,
    },
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
