import { type ProjectKind } from '@moddery/shared';

import { type Mod, type ProjectType } from '../../../types.js';

export interface ProjectDetails {
  id: string;
  slug: string;
  project_type: ProjectType;
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
