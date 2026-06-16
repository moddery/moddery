import { gql } from '@apollo/client';
import { type ProjectKind } from '@moddery/shared';

import { apolloClient } from '../apollo.js';
import { type Mod, type ProjectType } from '../types.js';

export type SortKey =
  | 'relevance'
  | 'downloads'
  | 'follows'
  | 'updated'
  | 'name';

export interface FilterTags {
  versions: string[];
  loaders: string[];
  categories: string[];
}

export interface SearchProjectsParams {
  projectType: ProjectType;
  query: string;
  sort: SortKey;
  page: number;
  limit: number;
  versions: string[];
  loaders: string[];
  categories: string[];
  signal?: AbortSignal;
}

export interface SearchProjectsResult {
  projects: Mod[];
  totalHits: number;
}

export interface ProjectDetails {
  id: string;
  slug: string;
  project_type: ProjectType;
  title: string;
  author: string;
  description: string;
  body: string;
  published: string;
  updated: string;
  license: {
    id: string;
    name: string;
    url: string | null;
  };
  downloads: number;
  followers: number;
  categories: string[];
  additional_categories: string[];
  loaders: string[];
  game_versions: string[];
  icon_url: string | null;
  issues_url: string | null;
  source_url: string | null;
  wiki_url: string | null;
  discord_url: string | null;
  donation_urls: { id: string; platform: string; url: string }[];
  gallery: ProjectGalleryImage[];
  color: number | null;
}

export interface ProjectGalleryImage {
  url: string;
  raw_url: string;
  featured: boolean;
  title: string | null;
  description: string | null;
  created: string;
  ordering: number;
}

export interface ProjectFile {
  filename: string;
  url: string;
  size: number;
  primary: boolean;
}

export interface ProjectVersion {
  id: string;
  name: string;
  version_number: string;
  version_type: 'release' | 'beta' | 'alpha';
  date_published: string;
  downloads: number;
  changelog: string | null;
  game_versions: string[];
  loaders: string[];
  files: ProjectFile[];
}

export interface ProjectMember {
  role: string;
  accepted: boolean;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface ProjectSummary {
  body: string;
  id: string;
  slug: string;
  title: string;
  summary: string;
  kind: ProjectKind;
  status: string;
  categories: string[];
  downloads: number;
  followers: number;
  gameVersions: string[];
  iconUrl: string | null;
  loaders: string[];
  gallery: {
    createdAt: string;
    description: string | null;
    displayUrl: string;
    featured: boolean;
    rawUrl: string;
    sortOrder: number;
    title: string | null;
  }[];
  updatedAt: string;
}

interface PlatformMetadataQueryData {
  platformMetadata: {
    gameVersions: string[];
    loaders: string[];
  };
}

interface ProjectsQueryData {
  projects: ProjectSummary[];
}

interface ProjectsQueryVariables {
  query?: {
    search?: string;
    sort?: string;
    tags?: string[];
  };
}

interface ProjectBySlugQueryData {
  projectBySlug: ProjectSummary | null;
}

interface ProjectBySlugQueryVariables {
  slug: string;
}

const PROJECTS_QUERY = gql`
  query CatalogProjects($query: CatalogQueryInput) {
    projects(query: $query) {
      body
      id
      slug
      title
      summary
      kind
      status
      categories
      downloads
      followers
      gameVersions
      iconUrl
      loaders
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      updatedAt
    }
  }
`;

const PROJECT_BY_SLUG_QUERY = gql`
  query CatalogProjectBySlug($slug: String!) {
    projectBySlug(slug: $slug) {
      body
      id
      slug
      title
      summary
      kind
      status
      categories
      downloads
      followers
      gameVersions
      iconUrl
      loaders
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      updatedAt
    }
  }
`;

const PLATFORM_METADATA_QUERY = gql`
  query CatalogPlatformMetadata {
    platformMetadata {
      gameVersions
      loaders
    }
  }
`;

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
  void projectType;
  throwIfAborted(signal);

  const { data } = await apolloClient.query<PlatformMetadataQueryData>({
    fetchPolicy: 'cache-first',
    query: PLATFORM_METADATA_QUERY,
  });

  throwIfAborted(signal);

  return {
    categories: [],
    loaders: data.platformMetadata.loaders,
    versions: data.platformMetadata.gameVersions,
  };
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
  const project = await fetchProjectDetails(slug, signal);

  return [
    {
      changelog: null,
      date_published: project.updated,
      downloads: project.downloads,
      files: [],
      game_versions: project.game_versions,
      id: `${project.id}_initial`,
      loaders: project.loaders,
      name: 'Initial release',
      version_number: '1.0.0',
      version_type: 'release',
    },
  ];
}

export async function fetchProjectMembers(
  _slug: string,
  signal?: AbortSignal,
): Promise<ProjectMember[]> {
  void _slug;
  await Promise.resolve();
  throwIfAborted(signal);
  return [];
}

function projectFromSummary(project: ProjectSummary): Mod {
  return {
    author: 'Moddery',
    categories: project.categories,
    client: 'optional',
    color: '#1d9bf0',
    description: project.summary,
    downloads: project.downloads,
    follows: project.followers,
    gameVersions: project.gameVersions,
    icon: project.iconUrl,
    loaders: normalizeLoaders(project.loaders),
    projectType: projectTypeFromKind(project.kind),
    server: 'optional',
    slug: project.slug,
    title: project.title,
    updated: project.updatedAt,
  };
}

function projectDetailsFromSummary(project: ProjectSummary): ProjectDetails {
  const mod = projectFromSummary(project);

  return {
    additional_categories: [],
    author: mod.author,
    body: project.body,
    categories: mod.categories,
    color: 0x1d9bf0,
    description: project.summary,
    discord_url: null,
    donation_urls: [],
    downloads: project.downloads,
    followers: 0,
    gallery: project.gallery.map((image) => ({
      created: image.createdAt,
      description: image.description,
      featured: image.featured,
      ordering: image.sortOrder,
      raw_url: image.rawUrl,
      title: image.title,
      url: image.displayUrl,
    })),
    game_versions: mod.gameVersions,
    icon_url: mod.icon,
    id: project.id,
    issues_url: null,
    license: {
      id: 'unknown',
      name: 'Unknown',
      url: null,
    },
    loaders: mod.loaders,
    project_type: mod.projectType ?? 'mod',
    published: project.updatedAt,
    slug: project.slug,
    source_url: null,
    title: project.title,
    updated: project.updatedAt,
    wiki_url: null,
  };
}

function projectTypeFromKind(kind: ProjectKind): ProjectType {
  switch (kind) {
    case 'DATAPACK':
      return 'datapack';
    case 'MODPACK':
      return 'modpack';
    case 'PLUGIN':
      return 'plugin';
    case 'RESOURCE_PACK':
      return 'resourcepack';
    case 'SHADER':
      return 'shader';
    case 'MOD':
      return 'mod';
  }
}

function projectKindFromType(projectType: ProjectType): ProjectKind {
  switch (projectType) {
    case 'datapack':
      return 'DATAPACK';
    case 'modpack':
      return 'MODPACK';
    case 'plugin':
      return 'PLUGIN';
    case 'resourcepack':
      return 'RESOURCE_PACK';
    case 'shader':
      return 'SHADER';
    case 'mod':
      return 'MOD';
  }
}

function projectSearchTags({
  categories,
  loaders,
  projectType,
  versions,
}: {
  categories: string[];
  loaders: string[];
  projectType: ProjectType;
  versions: string[];
}): string[] {
  return [
    `kind:${projectKindFromType(projectType)}`,
    ...categories.map((category) => `category:${category}`),
    ...loaders.map((loader) => `loader:${loader}`),
    ...versions.map((version) => `game-version:${version}`),
  ];
}

function sortToApiSort(sort: SortKey): string {
  if (sort === 'downloads') return 'downloads';
  if (sort === 'updated') return 'updated';
  return 'relevance';
}

function sortByName(projects: Mod[]): Mod[] {
  return [...projects].sort((a, b) => a.title.localeCompare(b.title));
}

function normalizeLoaders(loaders: string[]): string[] {
  return loaders.map((loader) => loader.toLowerCase());
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) {
    throw new DOMException('Request aborted', 'AbortError');
  }
}
