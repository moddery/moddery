import { type Mod } from '../../../types.js';
import { type ProjectSummary } from './projects.js';

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
  items: PublicCollectionItem[];
  projectCount: number;
  projects: Mod[];
  slug: string;
  updatedAt: string;
  visibility: string;
}

export interface ViewerCollectionChoice {
  id: string;
  items: { project: { slug: string } }[];
  name: string;
  projectCount: number;
  slug: string;
  visibility: string;
}

export interface PublicCollectionItem {
  addedBy: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  createdAt: string;
  project: Mod;
  sortOrder: number;
}

export interface ViewerCollectionChoicesQueryData {
  viewer: {
    collections: ViewerCollectionChoice[];
  } | null;
}

export interface PublicCollectionsQueryData {
  publicCollectionSearch: {
    collections: PublicCollectionSummary[];
    totalHits: number;
  };
}

export interface PublicCollectionsQueryVariables {
  limit: number;
  offset: number;
  search?: string | null;
}

export interface PublicCollectionsResult {
  collections: PublicCollection[];
  totalHits: number;
}

export interface PublicCollectionItemsResult {
  items: PublicCollectionItem[];
  totalHits: number;
}

export interface PublicCollectionBySlugQueryData {
  publicCollectionBySlug: PublicCollectionSummary;
}

export interface PublicCollectionItemSearchQueryData {
  publicCollectionItemSearch: {
    items: PublicCollectionItemSummary[];
    totalHits: number;
  };
}

export interface PublicCollectionBySlugQueryVariables {
  ownerUsername: string;
  slug: string;
}

export interface PublicCollectionItemSearchQueryVariables extends PublicCollectionBySlugQueryVariables {
  limit: number;
  offset: number;
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
  items: PublicCollectionItemSummary[];
  projectCount: number;
  projects: ProjectSummary[];
  slug: string;
  updatedAt: string;
  visibility: string;
}

export interface PublicCollectionItemSummary {
  addedBy: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  createdAt: string;
  project: ProjectSummary;
  sortOrder: number;
}
