import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import { type FilterTags } from '../../lib/catalog.ts';
import { type Layout } from '../ModCard.tsx';
import { type TagFacetOption } from '../FilterSidebar.tsx';
import {
  buildOptions,
  buildCategoryOptions,
  buildLicenseOptions,
  buildTagOptions,
  selectedCategoriesToTags,
  selectedLicensesToTags,
  selectedLoadersToTags,
  selectedVersionsToTags,
} from './discoverFilters.ts';

export const EMPTY_FILTER_TAGS: FilterTags = {
  categories: [],
  licenses: [],
  loaders: [],
  versions: [],
};

export interface DiscoverFilterSelection {
  categories: string[];
  licenses: string[];
  loaders: string[];
  versions: string[];
}

export function useDiscoverFilters({
  filterTags,
  initialSelection,
}: {
  filterTags: FilterTags;
  initialSelection?: DiscoverFilterSelection;
}) {
  const [layout, setLayout] = useState<Layout>('list');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(
    () => new Set(initialSelection?.versions ?? []),
  );
  const [selectedLoaders, setSelectedLoaders] = useState<Set<string>>(
    () => new Set(initialSelection?.loaders ?? []),
  );
  const [selectedLicenses, setSelectedLicenses] = useState<Set<string>>(
    () => new Set(initialSelection?.licenses ?? []),
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(initialSelection?.categories ?? []),
  );

  const selectedVersionValues = useMemo(
    () => [...selectedVersions].sort(),
    [selectedVersions],
  );
  const selectedLoaderValues = useMemo(
    () => [...selectedLoaders].sort(),
    [selectedLoaders],
  );
  const selectedLicenseValues = useMemo(
    () => [...selectedLicenses].sort(),
    [selectedLicenses],
  );
  const selectedCategoryValues = useMemo(
    () => [...selectedCategories].sort(),
    [selectedCategories],
  );

  const { versionOptions, loaderOptions, licenseOptions, categoryOptions } =
    useMemo(() => {
      return {
        versionOptions: buildOptions(filterTags.versions, selectedVersions),
        loaderOptions: buildOptions(filterTags.loaders, selectedLoaders),
        licenseOptions: buildLicenseOptions(
          filterTags.licenses,
          selectedLicenses,
        ),
        categoryOptions: buildCategoryOptions(
          filterTags.categories,
          selectedCategories,
        ),
      };
    }, [
      filterTags,
      selectedVersions,
      selectedLoaders,
      selectedLicenses,
      selectedCategories,
    ]);
  const tagOptions = useMemo(
    () =>
      buildTagOptions({
        categories: filterTags.categories,
      }),
    [filterTags],
  );
  const selectedTags = useMemo(
    () =>
      new Set([
        ...selectedCategoriesToTags(selectedCategories),
        ...selectedLoadersToTags(selectedLoaders),
        ...selectedLicensesToTags(selectedLicenses),
        ...selectedVersionsToTags(selectedVersions),
      ]),
    [selectedCategories, selectedLoaders, selectedLicenses, selectedVersions],
  );

  const activeFilterCount =
    selectedVersions.size +
    selectedLoaders.size +
    selectedLicenses.size +
    selectedCategories.size;

  function toggleIn(
    setter: Dispatch<SetStateAction<Set<string>>>,
    value: string,
    onChange: () => void,
  ) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    onChange();
  }

  function resetFilters() {
    setSelectedVersions(new Set());
    setSelectedLoaders(new Set());
    setSelectedLicenses(new Set());
    setSelectedCategories(new Set());
  }

  function replaceSelection(selection: DiscoverFilterSelection) {
    setSelectedVersions(new Set(selection.versions));
    setSelectedLoaders(new Set(selection.loaders));
    setSelectedLicenses(new Set(selection.licenses));
    setSelectedCategories(new Set(selection.categories));
  }

  function toggleTag(tag: TagFacetOption, onChange: () => void) {
    if (tag.kind === 'category') {
      toggleIn(setSelectedCategories, tag.value, onChange);
      return;
    }

    if (tag.kind === 'loader') {
      toggleIn(setSelectedLoaders, tag.value, onChange);
      return;
    }

    if (tag.kind === 'license') {
      toggleIn(setSelectedLicenses, tag.value, onChange);
      return;
    }

    toggleIn(setSelectedVersions, tag.value, onChange);
  }

  return {
    activeFilterCount,
    categoryOptions,
    licenseOptions,
    layout,
    loaderOptions,
    mobileFiltersOpen,
    replaceSelection,
    resetFilters,
    selectedCategories,
    selectedCategoryValues,
    selectedLoaders,
    selectedLoaderValues,
    selectedLicenses,
    selectedLicenseValues,
    selectedTags,
    selectedVersions,
    selectedVersionValues,
    setLayout,
    setMobileFiltersOpen,
    setSelectedCategories,
    setSelectedLoaders,
    setSelectedLicenses,
    setSelectedVersions,
    tagOptions,
    toggleCategory: (value: string, onChange: () => void) => {
      toggleIn(setSelectedCategories, value, onChange);
    },
    toggleLoader: (value: string, onChange: () => void) => {
      toggleIn(setSelectedLoaders, value, onChange);
    },
    toggleLicense: (value: string, onChange: () => void) => {
      toggleIn(setSelectedLicenses, value, onChange);
    },
    toggleTag,
    toggleVersion: (value: string, onChange: () => void) => {
      toggleIn(setSelectedVersions, value, onChange);
    },
    versionOptions,
  };
}
