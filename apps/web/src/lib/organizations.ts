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

interface OrganizationMemberSearchQueryData {
  organizationMemberSearch: OrganizationMemberSearchResult;
}

interface OrganizationMemberSearchQueryVariables {
  limit: number;
  offset: number;
  slug: string;
}

interface OrganizationProjectSearchQueryData {
  organizationProjectSearch: OrganizationProjectSearchResult;
}

interface OrganizationProjectSearchQueryVariables {
  limit: number;
  offset: number;
  slug: string;
}

interface PublicOrganizationsQueryData {
  publicOrganizationSearch: PublicOrganizationsResult;
}

interface PublicOrganizationsQueryVariables {
  limit: number;
  offset: number;
  search?: string | null;
}

export interface PublicOrganizationsResult {
  organizations: OrganizationProfile[];
  totalHits: number;
}

export interface OrganizationMemberSearchResult {
  members: OrganizationMember[];
  totalHits: number;
}

export interface OrganizationProjectSearchResult {
  projects: OrganizationProjectPreview[];
  totalHits: number;
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

const ORGANIZATION_MEMBER_SEARCH_QUERY = gql`
  query OrganizationMemberSearch($slug: String!, $limit: Int!, $offset: Int!) {
    organizationMemberSearch(slug: $slug, limit: $limit, offset: $offset) {
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
      totalHits
    }
  }
`;

const ORGANIZATION_PROJECT_SEARCH_QUERY = gql`
  ${ORGANIZATION_PROJECT_PREVIEW_FRAGMENT}
  query OrganizationProjectSearch($slug: String!, $limit: Int!, $offset: Int!) {
    organizationProjectSearch(slug: $slug, limit: $limit, offset: $offset) {
      projects {
        ...OrganizationProjectPreviewFields
      }
      totalHits
    }
  }
`;

const PUBLIC_ORGANIZATIONS_QUERY = gql`
  ${ORGANIZATION_PROFILE_FRAGMENT}
  query PublicOrganizations($search: String, $limit: Int!, $offset: Int!) {
    publicOrganizationSearch(search: $search, limit: $limit, offset: $offset) {
      organizations {
        ...OrganizationProfileFields
      }
      totalHits
    }
  }
`;

export async function fetchPublicOrganizations(
  search?: string | null,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<PublicOrganizationsResult> {
  const normalizedSearch = search?.trim() ?? '';
  const offset = Math.max(0, page - 1) * limit;
  const { data } = await apolloClient.query<
    PublicOrganizationsQueryData,
    PublicOrganizationsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PUBLIC_ORGANIZATIONS_QUERY,
    variables: {
      limit,
      offset,
      search: normalizedSearch === '' ? null : normalizedSearch,
    },
  });

  return data.publicOrganizationSearch;
}

export async function fetchOrganizationMembers(
  slug: string,
  page = 1,
  limit = 24,
  signal?: AbortSignal,
): Promise<OrganizationMemberSearchResult> {
  const { data } = await apolloClient.query<
    OrganizationMemberSearchQueryData,
    OrganizationMemberSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: ORGANIZATION_MEMBER_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      slug,
    },
  });

  return data.organizationMemberSearch;
}

export async function fetchOrganizationProjects(
  slug: string,
  page = 1,
  limit = 12,
  signal?: AbortSignal,
): Promise<OrganizationProjectSearchResult> {
  const { data } = await apolloClient.query<
    OrganizationProjectSearchQueryData,
    OrganizationProjectSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: ORGANIZATION_PROJECT_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      slug,
    },
  });

  return data.organizationProjectSearch;
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
  organization?: Pick<
    OrganizationProfile,
    'color' | 'iconUrl' | 'id' | 'name' | 'slug'
  >,
): Mod {
  const organizationName = organization?.name.trim() ?? '';

  return {
    author:
      organizationName ||
      (project.owner?.displayName ?? project.owner?.username ?? 'Unknown user'),
    authorUsername: organization ? null : (project.owner?.username ?? null),
    categories: project.categories,
    client: 'optional',
    color: project.color,
    description: project.summary,
    downloads: project.downloads,
    follows: project.followers,
    gameVersions: project.gameVersions,
    icon: project.iconUrl,
    loaders: project.loaders.map((loader) => loader.toLowerCase()),
    organization: organization
      ? {
          color: organization.color,
          iconUrl: organization.iconUrl,
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        }
      : null,
    projectType: projectTypeFromKind(project.kind),
    server: 'optional',
    slug: project.slug,
    title: project.title,
    updated: project.updatedAt,
  };
}
