import { type ProjectKind } from '@moddery/shared';

import { type Mod, type ProjectType } from '../../../types.js';

export interface ProjectDetails {
  id: string;
  slug: string;
  projectType: ProjectType;
  title: string;
  author: string;
  authorUsername?: string | null;
  color: number | null;
  organization?: {
    color: string | null;
    iconUrl: string | null;
    id: string;
    name: string;
    slug: string;
  } | null;
  description: string;
  body: string;
  published: string;
  updated: string;
  approvedAt: string | null;
  archivedAt: string | null;
  queuedAt: string | null;
  requestedStatus: string | null;
  status: string;
  license: {
    id: string;
    name: string;
    url: string | null;
  };
  moderationLock: ProjectModerationLock | null;
  downloads: number;
  followers: number;
  categories: string[];
  additionalCategories: string[];
  loaders: string[];
  gameVersions: string[];
  iconUrl: string | null;
  issuesUrl: string | null;
  sourceUrl: string | null;
  wikiUrl: string | null;
  discordUrl: string | null;
  donationUrls: { id: string; platform: string; url: string }[];
  externalLinks: { id: string; label: string; url: string }[];
  gallery: ProjectGalleryImage[];
}

export interface ProjectModerationLock {
  createdAt: string;
  expiresAt: string;
  id: string;
  moderator: {
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface ProjectGalleryImage {
  url: string;
  rawUrl: string;
  featured: boolean;
  title: string | null;
  description: string | null;
  created: string;
  ordering: number;
}

export interface ProjectSummary {
  body: string;
  color: string | null;
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
  approvedAt: string | null;
  archivedAt: string | null;
  publishedAt: string | null;
  queuedAt: string | null;
  requestedStatus: string | null;
  issuesUrl: string | null;
  license: {
    id: string;
    name: string;
    url: string | null;
  };
  moderationLock: ProjectModerationLock | null;
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
    id: string;
    rawUrl: string;
    sortOrder: number;
    title: string | null;
  }[];
  updatedAt: string;
  wikiUrl: string | null;
}

export interface ProjectsQueryData {
  projectSearch: {
    projects: ProjectSummary[];
    totalHits: number;
  };
}

export interface ViewerFollowedProjectsQueryData {
  viewerFollowedProjectSearch: {
    projects: ProjectSummary[];
    totalHits: number;
  };
}

export interface ViewerFollowedProjectsQueryVariables {
  limit: number;
  offset: number;
}

export interface ViewerFollowedProjectsResult {
  projects: Mod[];
  totalHits: number;
}

export interface ProjectsQueryVariables {
  query?: {
    limit?: number;
    offset?: number;
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
