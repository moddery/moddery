import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  fetchFilterTags,
  searchProjects,
  type SortKey,
} from '../../lib/catalog.ts';
import { projectTypeMeta } from '../../lib/projectTypes.ts';
import { type ProjectType } from '../../types.ts';
import {
  EMPTY_FILTER_TAGS,
  useDiscoverFilters,
  type DiscoverFilterSelection,
} from './useDiscoverFilters.ts';
import { type TagFacetOption } from '../FilterSidebar.tsx';

interface UseDiscoverStateInput {
  projectType: ProjectType;
  shouldLoadCatalog: boolean;
  syncUrl: boolean;
}

export function useDiscoverState({
  projectType,
  shouldLoadCatalog,
  syncUrl,
}: UseDiscoverStateInput) {
  const initialUrlState = readDiscoverUrlState();
  const [query, setQuery] = useState(initialUrlState.query);
  const [sort, setSort] = useState<SortKey>(initialUrlState.sort);
  const [view, setView] = useState(initialUrlState.view);
  const [page, setPage] = useState(initialUrlState.page);
  const pageSize = Number(view);

  const filterTagsQuery = useQuery({
    enabled: shouldLoadCatalog,
    queryFn: ({ signal }) => fetchFilterTags(projectType, signal),
    queryKey: ['catalog', 'filter-tags', projectType],
  });
  const filterTags = filterTagsQuery.data ?? EMPTY_FILTER_TAGS;
  const filters = useDiscoverFilters({
    filterTags,
    initialSelection: initialUrlState.filters,
  });

  const applyUrlState = useCallback(() => {
    const urlState = readDiscoverUrlState();
    setQuery(urlState.query);
    setSort(urlState.sort);
    setView(urlState.view);
    setPage(urlState.page);
    filters.replaceSelection(urlState.filters);
  }, [filters]);

  useEffect(() => {
    if (!syncUrl) return;

    window.addEventListener('popstate', applyUrlState);
    return () => {
      window.removeEventListener('popstate', applyUrlState);
    };
  }, [applyUrlState, syncUrl]);

  useEffect(() => {
    if (!syncUrl) return;

    const url = new URL(window.location.href);
    url.pathname = `/${projectTypeMeta(projectType).path}`;
    url.searchParams.delete('project');
    url.searchParams.delete('type');
    url.searchParams.delete('tab');
    setOptionalParam(url, 'q', query.trim());
    setOptionalParam(url, 'sort', sort === 'relevance' ? '' : sort);
    setOptionalParam(url, 'view', view === '20' ? '' : view);
    setOptionalParam(url, 'page', page === 1 ? '' : String(page));
    setListParam(url, 'version', filters.selectedVersionValues);
    setListParam(url, 'loader', filters.selectedLoaderValues);
    setListParam(url, 'category', filters.selectedCategoryValues);

    window.history.replaceState(null, '', url);
  }, [
    filters.selectedCategoryValues,
    filters.selectedLoaderValues,
    filters.selectedVersionValues,
    page,
    projectType,
    query,
    sort,
    syncUrl,
    view,
  ]);

  const projectsQuery = useQuery({
    enabled: shouldLoadCatalog,
    queryFn: ({ signal }) =>
      searchProjects({
        projectType,
        query,
        sort,
        page,
        limit: pageSize,
        versions: filters.selectedVersionValues,
        loaders: filters.selectedLoaderValues,
        categories: filters.selectedCategoryValues,
        signal,
      }),
    queryKey: [
      'catalog',
      'projects',
      projectType,
      query,
      sort,
      page,
      pageSize,
      filters.selectedVersionValues,
      filters.selectedLoaderValues,
      filters.selectedCategoryValues,
    ],
  });

  const mods = projectsQuery.data?.projects ?? [];
  const total = projectsQuery.data?.totalHits ?? 0;
  const loading = projectsQuery.isLoading || projectsQuery.isFetching;
  const error =
    projectsQuery.error instanceof Error ? projectsQuery.error.message : null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const hasActiveFilters = query.trim() !== '' || filters.activeFilterCount > 0;

  function clearAll() {
    setQuery('');
    filters.resetFilters();
    setPage(1);
  }

  const resetPage = () => {
    setPage(1);
  };

  return {
    applyUrlState,
    activeFilterCount: filters.activeFilterCount,
    categoryOptions: filters.categoryOptions,
    clearAll,
    error,
    hasActiveFilters,
    layout: filters.layout,
    loaderOptions: filters.loaderOptions,
    loading,
    mobileFiltersOpen: filters.mobileFiltersOpen,
    mods,
    page: safePage,
    resetFilters: filters.resetFilters,
    setLayout: filters.setLayout,
    setMobileFiltersOpen: filters.setMobileFiltersOpen,
    setPage,
    setQuery,
    setSelectedCategories: filters.setSelectedCategories,
    setSelectedLoaders: filters.setSelectedLoaders,
    setSelectedVersions: filters.setSelectedVersions,
    setSort,
    setView,
    query,
    selectedCategories: filters.selectedCategories,
    selectedLoaders: filters.selectedLoaders,
    selectedTags: filters.selectedTags,
    selectedVersions: filters.selectedVersions,
    sort,
    tagOptions: filters.tagOptions,
    toggleCategory: (value: string) => {
      filters.toggleCategory(value, resetPage);
    },
    toggleLoader: (value: string) => {
      filters.toggleLoader(value, resetPage);
    },
    toggleTag: (tag: TagFacetOption) => {
      filters.toggleTag(tag, resetPage);
    },
    toggleVersion: (value: string) => {
      filters.toggleVersion(value, resetPage);
    },
    total,
    totalPages,
    versionOptions: filters.versionOptions,
    view,
  };
}

function readDiscoverUrlState(): {
  filters: DiscoverFilterSelection;
  page: number;
  query: string;
  sort: SortKey;
  view: string;
} {
  const params = new URLSearchParams(window.location.search);

  return {
    filters: {
      categories: params.getAll('category'),
      loaders: params.getAll('loader'),
      versions: params.getAll('version'),
    },
    page: readPositiveInteger(params.get('page'), 1),
    query: params.get('q') ?? '',
    sort: readSort(params.get('sort')),
    view: readView(params.get('view')),
  };
}

function readPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readSort(value: string | null): SortKey {
  if (
    value === 'downloads' ||
    value === 'follows' ||
    value === 'updated' ||
    value === 'name'
  ) {
    return value;
  }

  return 'relevance';
}

function readView(value: string | null): string {
  return value === '5' || value === '10' || value === '20' ? value : '20';
}

function setOptionalParam(url: URL, key: string, value: string) {
  if (value) {
    url.searchParams.set(key, value);
    return;
  }

  url.searchParams.delete(key);
}

function setListParam(url: URL, key: string, values: string[]) {
  url.searchParams.delete(key);
  values.forEach((value) => {
    url.searchParams.append(key, value);
  });
}
