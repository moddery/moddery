import { isProjectCategoryTag } from '@moddery/shared';

import { type FacetOption, type TagFacetOption } from '../FilterSidebar.tsx';

export function buildOptions(
  values: string[],
  selected: Set<string>,
): FacetOption[] {
  const merged = new Set([...values, ...selected]);
  return [...merged].map((value) => ({ value }));
}

export function buildTagOptions({
  categories,
}: {
  categories: string[];
}): TagFacetOption[] {
  return [
    ...unique(categories)
      .filter(isProjectCategoryTag)
      .map((value): TagFacetOption => ({ kind: 'category', value })),
  ];
}

export function selectedCategoriesToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `category:${value}`);
}

export function selectedLoadersToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `loader:${value}`);
}

export function selectedVersionsToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `version:${value}`);
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
