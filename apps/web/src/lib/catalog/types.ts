import {
  type DependencyKind,
  type ProjectKind,
  type ReportReason,
} from '@moddery/shared';

import { type Mod, type ProjectType } from '../../types.js';

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
  id: string;
  filename: string;
  hashes: {
    algorithm: string;
    value: string;
  }[];
  url: string;
  size: number;
  primary: boolean;
  scans: {
    createdAt: string;
    details: string | null;
    id: string;
    status: string;
    verdict: string | null;
  }[];
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

export interface ProjectSummary {
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

export interface PlatformMetadataQueryData {
  platformMetadata: {
    categories: {
      slug: string;
    }[];
    gameVersions: string[];
    loaders: string[];
  };
}

export interface ProjectsQueryData {
  projects: ProjectSummary[];
}

export interface ProjectsQueryVariables {
  query?: {
    search?: string;
    sort?: string;
    tags?: string[];
  };
}

export interface ProjectBySlugQueryData {
  projectBySlug: ProjectSummary | null;
}

export interface ProjectBySlugQueryVariables {
  slug: string;
}

export interface PublicCollectionsQueryData {
  publicCollections: PublicCollectionSummary[];
}

export interface PublicCollectionSummary {
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

export interface VersionsForProjectQueryData {
  versionsForProject: VersionSummary[];
}

export interface VersionsForProjectQueryVariables {
  projectSlug: string;
}

export interface ProjectMembersQueryData {
  projectMembers: ProjectMemberSummary[];
}

export interface ProjectMembersQueryVariables {
  projectSlug: string;
}

export interface ProjectFollowStateQueryData {
  viewerProjectFollowState: ProjectFollowState | null;
}

export interface ProjectFollowStateMutationData {
  followProject?: ProjectFollowState;
  unfollowProject?: ProjectFollowState;
}

export interface RecordDownloadMutationData {
  recordDownload: {
    fileId: string;
    projectDownloads: number;
    projectId: string;
    versionDownloads: number;
    versionId: string;
  };
}

export interface RecordProjectViewMutationData {
  recordProjectView: {
    projectId: string;
    projectSlug: string;
  };
}

export interface RecordDownloadMutationVariables {
  input: {
    fileId: string;
  };
}

export interface RecordProjectViewMutationVariables {
  input: {
    projectSlug: string;
  };
}

export interface ProjectAnalyticsQueryData {
  projectAnalytics: ProjectAnalytics | null;
}

export interface ProjectAnalyticsQueryVariables {
  projectSlug: string;
}

export interface CreateProjectReportMutationData {
  createProjectReport: ReportSummary;
}

export interface CreateVersionReportMutationData {
  createVersionReport: ReportSummary;
}

export interface CreateProjectReportMutationVariables {
  input: {
    body: string;
    projectSlug: string;
    reason: ReportReason;
  };
}

export interface CreateVersionReportMutationVariables {
  input: {
    body: string;
    reason: ReportReason;
    versionId: string;
  };
}

export interface ProjectMemberSummary {
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

export interface VersionSummary {
  changelog: string | null;
  channel: 'RELEASE' | 'BETA' | 'ALPHA';
  datePublished: string | null;
  dependencies: VersionDependency[];
  downloads: number;
  files: {
    fileName: string;
    hashes: {
      algorithm: string;
      value: string;
    }[];
    id: string;
    primary: boolean;
    scans: {
      createdAt: string;
      details: string | null;
      id: string;
      status: string;
      verdict: string | null;
    }[];
    sizeBytes: string;
    url: string;
  }[];
  gameVersions: string[];
  id: string;
  loaders: string[];
  name: string;
  versionNumber: string;
}
