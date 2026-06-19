import { type Dispatch, type SetStateAction } from 'react';

import { type SortKey } from '../../lib/catalog.ts';
import { type ProjectTypeMeta } from '../../lib/projectTypes.ts';
import { type Mod } from '../../types.ts';
import { type FacetOption, type TagFacetOption } from '../FilterSidebar.tsx';
import { type Layout, type SearchTag } from '../ModCard.tsx';

export interface DiscoverPageProps {
  activeFilterCount: number;
  categoryOptions: FacetOption[];
  clearAll: () => void;
  error: string | null;
  hasActiveFilters: boolean;
  layout: Layout;
  licenseOptions: FacetOption[];
  loaderOptions: FacetOption[];
  loading: boolean;
  meta: ProjectTypeMeta;
  mobileFiltersOpen: boolean;
  mods: Mod[];
  onOpenProject: (mod: Mod) => void;
  onPage: (page: number) => void;
  onTagSearch: (tag: SearchTag) => void;
  page: number;
  query: string;
  setQuery: (query: string) => void;
  selectedCategories: Set<string>;
  selectedLicenses: Set<string>;
  selectedLoaders: Set<string>;
  selectedTags: Set<string>;
  selectedVersions: Set<string>;
  setLayout: (layout: Layout) => void;
  setMobileFiltersOpen: Dispatch<SetStateAction<boolean>>;
  setSort: (sort: SortKey) => void;
  setView: (view: string) => void;
  sort: SortKey;
  tagOptions: TagFacetOption[];
  toggleCategory: (value: string) => void;
  toggleLicense: (value: string) => void;
  toggleLoader: (value: string) => void;
  toggleTag: (tag: TagFacetOption) => void;
  toggleVersion: (value: string) => void;
  total: number;
  totalPages: number;
  versionOptions: FacetOption[];
  view: string;
}
