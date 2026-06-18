import { type ProjectKind } from '@moddery/shared';

import { type Mod, type ProjectType } from '../../../types.js';

export type SortKey =
  | 'relevance'
  | 'downloads'
  | 'follows'
  | 'updated'
  | 'name';

export interface FilterTags {
  versions: string[];
  loaders: string[];
  categories: CategoryFilterTag[];
}

export interface CategoryFilterTag {
  description: string | null;
  name: string;
  projectKind: ProjectKind | null;
  slug: string;
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

export interface PlatformMetadataQueryData {
  platformMetadata: {
    categories: CategoryFilterTag[];
    gameVersions: string[];
    loaders: string[];
    licenses: {
      key: string;
      name: string;
      url: string | null;
    }[];
  };
}
