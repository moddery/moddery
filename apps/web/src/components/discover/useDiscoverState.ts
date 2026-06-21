import { useCallback, useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  fetchFilterTags,
  searchProjects,
  type SortKey,
} from '../../lib/catalog.ts';
import { type ProjectType } from '../../types.ts';
import { EMPTY_FILTER_TAGS, useDiscoverFilters } from './useDiscoverFilters.ts';
import { type TagFacetOption } from '../FilterSidebar.tsx';
import {
  readDiscoverUrlState,
  writeDiscoverUrlState,
} from './discoverUrlState.ts';

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

    writeDiscoverUrlState({
      categories: filters.selectedCategoryValues,
      licenses: filters.selectedLicenseValues,
      loaders: filters.selectedLoaderValues,
      page,
      projectType,
      query,
      sort,
      versions: filters.selectedVersionValues,
      view,
    });
  }, [
    filters.selectedCategoryValues,
    filters.selectedLicenseValues,
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
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      searchProjects({
        projectType,
        query,
        sort,
        page,
        limit: pageSize,
        versions: filters.selectedVersionValues,
        loaders: filters.selectedLoaderValues,
        licenses: filters.selectedLicenseValues,
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
      filters.selectedLicenseValues,
      filters.selectedCategoryValues,
    ],
  });

  const mods = projectsQuery.data?.projects ?? [];
  const total = projectsQuery.data?.totalHits ?? 0;
  const loading = projectsQuery.isLoading;
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

  const updateQuery = (value: string) => {
    setQuery(value);
    resetPage();
  };

  const updateSort = (value: SortKey) => {
    setSort(value);
    resetPage();
  };

  const updateView = (value: string) => {
    setView(value);
    resetPage();
  };

  return {
    applyUrlState,
    activeFilterCount: filters.activeFilterCount,
    categoryOptions: filters.categoryOptions,
    licenseOptions: filters.licenseOptions,
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
    setQuery: updateQuery,
    setSelectedCategories: filters.setSelectedCategories,
    setSelectedLoaders: filters.setSelectedLoaders,
    setSelectedLicenses: filters.setSelectedLicenses,
    setSelectedVersions: filters.setSelectedVersions,
    setSort: updateSort,
    setView: updateView,
    query,
    selectedCategories: filters.selectedCategories,
    selectedLoaders: filters.selectedLoaders,
    selectedLicenses: filters.selectedLicenses,
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
    toggleLicense: (value: string) => {
      filters.toggleLicense(value, resetPage);
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
