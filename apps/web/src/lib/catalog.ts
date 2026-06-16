import { gql } from '@apollo/client';
import {
  type DependencyKind,
  type ProjectKind,
  type ReportReason,
} from '@moddery/shared';

import { apolloClient, authTokenStorageKey } from '../apollo.js';
import { type Mod, type ProjectType } from '../types.js';
import { projectTypeFromKind } from './projectTypes.js';

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

export interface PublicCollection {
  color: string | null;
  createdAt: string;
  description: string | null;
  iconUrl: string | null;
  id: string;
  name: string;
  owner: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
  projectCount: number;
  projects: Mod[];
  slug: string;
  updatedAt: string;
  visibility: string;
}

export interface ProjectFollowState {
  followers: number;
  following: boolean;
  projectSlug: string;
}

export interface ReportSummary {
  body: string;
  createdAt: string;
  id: string;
  projectId: string | null;
  reason: ReportReason;
  state: string;
  userTargetId: string | null;
  versionId: string | null;
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
  dependencies: VersionDependency[];
  changelog: string | null;
  game_versions: string[];
  loaders: string[];
  files: ProjectFile[];
}

export interface VersionDependency {
  dependencyKind: DependencyKind;
  externalFileName: string | null;
  id: string;
  targetProject: {
    id: string;
    slug: string;
    title: string;
  } | null;
  targetVersion: {
    id: string;
    versionNumber: string;
  } | null;
}

export interface ProjectMember {
  role: string;
  accepted: boolean;
  owner: boolean;
  sortOrder: number;
  user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface ProjectAnalytics {
  days: ProjectAnalyticsDay[];
  downloadsLast30Days: number;
  projectSlug: string;
  totalDownloads: number;
  totalViews: number;
  viewsLast30Days: number;
}

export interface ProjectAnalyticsDay {
  date: string;
  downloads: number;
  views: number;
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
  discordUrl: string | null;
  downloads: number;
  followers: number;
  gameVersions: string[];
  iconUrl: string | null;
  issuesUrl: string | null;
  license: {
    id: string;
    name: string;
    url: string | null;
  };
  links: {
    kind: string;
    label: string | null;
    url: string;
  }[];
  loaders: string[];
  sourceUrl: string | null;
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
  wikiUrl: string | null;
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

interface PublicCollectionsQueryData {
  publicCollections: PublicCollectionSummary[];
}

interface PublicCollectionSummary {
  color: string | null;
  createdAt: string;
  description: string | null;
  iconUrl: string | null;
  id: string;
  name: string;
  owner: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
  projectCount: number;
  projects: ProjectSummary[];
  slug: string;
  updatedAt: string;
  visibility: string;
}

interface VersionsForProjectQueryData {
  versionsForProject: VersionSummary[];
}

interface VersionsForProjectQueryVariables {
  projectSlug: string;
}

interface ProjectMembersQueryData {
  projectMembers: ProjectMemberSummary[];
}

interface ProjectMembersQueryVariables {
  projectSlug: string;
}

interface ProjectFollowStateQueryData {
  viewerProjectFollowState: ProjectFollowState | null;
}

interface ProjectFollowStateMutationData {
  followProject?: ProjectFollowState;
  unfollowProject?: ProjectFollowState;
}

interface ProjectAnalyticsQueryData {
  projectAnalytics: ProjectAnalytics | null;
}

interface ProjectAnalyticsQueryVariables {
  projectSlug: string;
}

interface CreateProjectReportMutationData {
  createProjectReport: ReportSummary;
}

interface CreateVersionReportMutationData {
  createVersionReport: ReportSummary;
}

interface CreateProjectReportMutationVariables {
  input: {
    body: string;
    projectSlug: string;
    reason: ReportReason;
  };
}

interface CreateVersionReportMutationVariables {
  input: {
    body: string;
    reason: ReportReason;
    versionId: string;
  };
}

interface ProjectMemberSummary {
  accepted: boolean;
  owner: boolean;
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

interface VersionSummary {
  changelog: string | null;
  channel: 'RELEASE' | 'BETA' | 'ALPHA';
  datePublished: string | null;
  dependencies: VersionDependency[];
  downloads: number;
  files: {
    fileName: string;
    primary: boolean;
    sizeBytes: string;
    url: string;
  }[];
  gameVersions: string[];
  id: string;
  loaders: string[];
  name: string;
  versionNumber: string;
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
      discordUrl
      downloads
      followers
      gameVersions
      iconUrl
      issuesUrl
      license {
        id
        name
        url
      }
      links {
        kind
        label
        url
      }
      loaders
      sourceUrl
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
      wikiUrl
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
      discordUrl
      downloads
      followers
      gameVersions
      iconUrl
      issuesUrl
      license {
        id
        name
        url
      }
      links {
        kind
        label
        url
      }
      loaders
      sourceUrl
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
      wikiUrl
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

const VERSIONS_FOR_PROJECT_QUERY = gql`
  query VersionsForProject($projectSlug: String!) {
    versionsForProject(projectSlug: $projectSlug) {
      changelog
      channel
      datePublished
      dependencies {
        dependencyKind
        externalFileName
        id
        targetProject {
          id
          slug
          title
        }
        targetVersion {
          id
          versionNumber
        }
      }
      downloads
      files {
        fileName
        primary
        sizeBytes
        url
      }
      gameVersions
      id
      loaders
      name
      versionNumber
    }
  }
`;

const PROJECT_MEMBERS_QUERY = gql`
  query ProjectMembers($projectSlug: String!) {
    projectMembers(projectSlug: $projectSlug) {
      accepted
      owner
      role
      sortOrder
      user {
        avatarUrl
        displayName
        id
        username
      }
    }
  }
`;

const VIEWER_PROJECT_FOLLOW_STATE_QUERY = gql`
  query ViewerProjectFollowState($projectSlug: String!) {
    viewerProjectFollowState(projectSlug: $projectSlug) {
      followers
      following
      projectSlug
    }
  }
`;

const PROJECT_ANALYTICS_QUERY = gql`
  query ProjectAnalytics($projectSlug: String!) {
    projectAnalytics(projectSlug: $projectSlug) {
      days {
        date
        downloads
        views
      }
      downloadsLast30Days
      projectSlug
      totalDownloads
      totalViews
      viewsLast30Days
    }
  }
`;

const FOLLOW_PROJECT_MUTATION = gql`
  mutation FollowProject($projectSlug: String!) {
    followProject(projectSlug: $projectSlug) {
      followers
      following
      projectSlug
    }
  }
`;

const UNFOLLOW_PROJECT_MUTATION = gql`
  mutation UnfollowProject($projectSlug: String!) {
    unfollowProject(projectSlug: $projectSlug) {
      followers
      following
      projectSlug
    }
  }
`;

const CREATE_PROJECT_REPORT_MUTATION = gql`
  mutation CreateProjectReport($input: CreateProjectReportInput!) {
    createProjectReport(input: $input) {
      body
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

const CREATE_VERSION_REPORT_MUTATION = gql`
  mutation CreateVersionReport($input: CreateVersionReportInput!) {
    createVersionReport(input: $input) {
      body
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

const PUBLIC_COLLECTIONS_QUERY = gql`
  query PublicCollections {
    publicCollections {
      color
      createdAt
      description
      iconUrl
      id
      name
      owner {
        avatarUrl
        displayName
        id
        username
      }
      projectCount
      projects {
        body
        id
        slug
        title
        summary
        kind
        status
        categories
        discordUrl
        downloads
        followers
        gameVersions
        iconUrl
        issuesUrl
        license {
          id
          name
          url
        }
        links {
          kind
          label
          url
        }
        loaders
        sourceUrl
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
        wikiUrl
      }
      slug
      updatedAt
      visibility
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

export async function fetchPublicCollections(
  signal?: AbortSignal,
): Promise<PublicCollection[]> {
  throwIfAborted(signal);

  const { data } = await apolloClient.query<PublicCollectionsQueryData>({
    fetchPolicy: 'network-only',
    query: PUBLIC_COLLECTIONS_QUERY,
  });

  throwIfAborted(signal);

  return data.publicCollections.map(collectionFromSummary);
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
  throwIfAborted(signal);

  const { data } = await apolloClient.query<
    VersionsForProjectQueryData,
    VersionsForProjectQueryVariables
  >({
    fetchPolicy: 'network-only',
    query: VERSIONS_FOR_PROJECT_QUERY,
    variables: { projectSlug: slug },
  });

  throwIfAborted(signal);

  return data.versionsForProject.map(versionFromSummary);
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
    fetchPolicy: 'network-only',
    query: PROJECT_MEMBERS_QUERY,
    variables: { projectSlug: slug },
  });

  throwIfAborted(signal);

  return data.projectMembers.map(memberFromSummary);
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
    fetchPolicy: 'network-only',
    query: PROJECT_ANALYTICS_QUERY,
    variables: { projectSlug: slug },
  });

  throwIfAborted(signal);

  return data.projectAnalytics;
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

export async function createProjectReport(input: {
  body: string;
  projectSlug: string;
  reason: ReportReason;
}): Promise<ReportSummary> {
  const { data } = await apolloClient.mutate<
    CreateProjectReportMutationData,
    CreateProjectReportMutationVariables
  >({
    mutation: CREATE_PROJECT_REPORT_MUTATION,
    variables: { input },
  });

  if (data === null || data === undefined) {
    throw new Error('Report did not return from the API');
  }

  return data.createProjectReport;
}

export async function createVersionReport(input: {
  body: string;
  reason: ReportReason;
  versionId: string;
}): Promise<ReportSummary> {
  const { data } = await apolloClient.mutate<
    CreateVersionReportMutationData,
    CreateVersionReportMutationVariables
  >({
    mutation: CREATE_VERSION_REPORT_MUTATION,
    variables: { input },
  });

  if (data === null || data === undefined) {
    throw new Error('Report did not return from the API');
  }

  return data.createVersionReport;
}

export function hasAuthToken(): boolean {
  return localStorage.getItem(authTokenStorageKey) !== null;
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

function collectionFromSummary(
  collection: PublicCollectionSummary,
): PublicCollection {
  return {
    ...collection,
    projects: collection.projects.map(projectFromSummary),
  };
}

function projectDetailsFromSummary(project: ProjectSummary): ProjectDetails {
  const mod = projectFromSummary(project);
  const sourceUrl =
    project.sourceUrl ?? projectLinkUrl(project.links, 'SOURCE');
  const issuesUrl =
    project.issuesUrl ?? projectLinkUrl(project.links, 'ISSUES');
  const wikiUrl = project.wikiUrl ?? projectLinkUrl(project.links, 'WIKI');
  const discordUrl =
    project.discordUrl ?? projectLinkUrl(project.links, 'DISCORD');

  return {
    additional_categories: [],
    author: mod.author,
    body: project.body,
    categories: mod.categories,
    color: 0x1d9bf0,
    description: project.summary,
    discord_url: discordUrl,
    donation_urls: project.links
      .filter((link) => link.kind === 'DONATION')
      .map((link) => ({
        id: link.label ?? link.url,
        platform: link.label ?? 'Donation',
        url: link.url,
      })),
    downloads: project.downloads,
    followers: project.followers,
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
    issues_url: issuesUrl,
    license: project.license,
    loaders: mod.loaders,
    project_type: mod.projectType ?? 'mod',
    published: project.updatedAt,
    slug: project.slug,
    source_url: sourceUrl,
    title: project.title,
    updated: project.updatedAt,
    wiki_url: wikiUrl,
  };
}

function projectLinkUrl(
  links: ProjectSummary['links'],
  kind: string,
): string | null {
  return links.find((link) => link.kind === kind)?.url ?? null;
}

function versionFromSummary(version: VersionSummary): ProjectVersion {
  return {
    changelog: version.changelog,
    date_published: version.datePublished ?? new Date().toISOString(),
    dependencies: version.dependencies,
    downloads: version.downloads,
    files: version.files.map((file) => ({
      filename: file.fileName,
      primary: file.primary,
      size: Number(file.sizeBytes),
      url: file.url,
    })),
    game_versions: version.gameVersions,
    id: version.id,
    loaders: normalizeLoaders(version.loaders),
    name: version.name,
    version_number: version.versionNumber,
    version_type:
      version.channel.toLowerCase() as ProjectVersion['version_type'],
  };
}

function memberFromSummary(member: ProjectMemberSummary): ProjectMember {
  return {
    accepted: member.accepted,
    owner: member.owner,
    role: member.role,
    sortOrder: member.sortOrder,
    user: {
      avatar_url: member.user.avatarUrl,
      display_name: member.user.displayName,
      id: member.user.id,
      username: member.user.username,
    },
  };
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
