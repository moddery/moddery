import { type DependencyKind, type ProjectKind } from '@moddery/shared';

export interface ProjectFile {
  id: string;
  filename: string;
  hashes: {
    algorithm: string;
    value: string;
  }[];
  kind: 'UNIVERSAL' | 'CLIENT' | 'SERVER';
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
  author: {
    avatar_url: string | null;
    display_name: string | null;
    id: string;
    username: string;
  } | null;
  id: string;
  name: string;
  version_number: string;
  version_type: 'release' | 'beta' | 'alpha';
  created_at: string;
  date_published: string;
  downloads: number;
  featured: boolean;
  dependencies: VersionDependency[];
  changelog: string | null;
  game_versions: string[];
  loaders: string[];
  files: ProjectFile[];
  requested_status: string | null;
  sort_order: number;
  status: string;
  updated_at: string;
}

export interface VersionDependency {
  dependencyKind: DependencyKind;
  externalFileName: string | null;
  id: string;
  targetProject: {
    id: string;
    kind: ProjectKind;
    slug: string;
    title: string;
  } | null;
  targetVersion: {
    id: string;
    versionNumber: string;
  } | null;
}

export interface VersionsForProjectQueryData {
  versionsForProject: VersionSummary[];
}

export interface VersionsForProjectQueryVariables {
  projectSlug: string;
}

export interface VersionSearchForProjectQueryData {
  versionSearchForProject: {
    totalHits: number;
    versions: VersionSummary[];
  };
}

export interface VersionSearchForProjectQueryVariables {
  gameVersion?: string | null;
  limit: number;
  loader?: string | null;
  offset: number;
  projectSlug: string;
  search?: string | null;
}

export interface ProjectVersionSearchResult {
  totalHits: number;
  versions: ProjectVersion[];
}

export interface VersionSummary {
  author: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  changelog: string | null;
  channel: 'RELEASE' | 'BETA' | 'ALPHA';
  createdAt: string;
  datePublished: string | null;
  dependencies: VersionDependency[];
  downloads: number;
  featured: boolean;
  files: {
    fileName: string;
    hashes: {
      algorithm: string;
      value: string;
    }[];
    id: string;
    kind: 'UNIVERSAL' | 'CLIENT' | 'SERVER';
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
  requestedStatus: string | null;
  sortOrder: number;
  status: string;
  updatedAt: string;
  versionNumber: string;
}
