import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  fetchFilterTags,
  searchProjects,
  type SortKey,
} from '../../lib/catalog.ts';
import { type ProjectType } from '../../types.ts';
import { EMPTY_FILTER_TAGS, useDiscoverFilters } from './useDiscoverFilters.ts';
import { type TagFacetOption } from '../FilterSidebar.tsx';

interface UseDiscoverStateInput {
  projectType: ProjectType;
  shouldLoadCatalog: boolean;
}

export function useDiscoverState({
  projectType,
  shouldLoadCatalog,
}: UseDiscoverStateInput) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [view, setView] = useState('20');
  const [page, setPage] = useState(1);
  const pageSize = Number(view);

  const filterTagsQuery = useQuery({
    enabled: shouldLoadCatalog,
    queryFn: ({ signal }) => fetchFilterTags(projectType, signal),
    queryKey: ['catalog', 'filter-tags', projectType],
  });
  const filterTags = filterTagsQuery.data ?? EMPTY_FILTER_TAGS;
  const filters = useDiscoverFilters({
    filterTags,
  });

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
