import { isProjectCategoryTag } from '@moddery/shared';

import {
  type CategoryFilterTag,
  type PlatformLicense,
} from '../../lib/catalog.ts';
import { type FacetOption, type TagFacetOption } from '../FilterSidebar.tsx';

export function buildOptions(
  values: string[],
  selected: Set<string>,
): FacetOption[] {
  const merged = new Set([...values, ...selected]);
  return [...merged].map((value) => ({ value }));
}

export function buildCategoryOptions(
  categories: CategoryFilterTag[],
  selected: Set<string>,
): FacetOption[] {
  const options = new Map<string, FacetOption>(
    uniqueCategories(categories).map((category) => [
      category.slug,
      {
        description: category.description,
        label: category.name,
        value: category.slug,
      },
    ]),
  );

  for (const value of selected) {
    if (!options.has(value)) options.set(value, { value });
  }

  return [...options.values()];
}

export function buildLicenseOptions(
  licenses: PlatformLicense[],
  selected: Set<string>,
): FacetOption[] {
  const options = new Map<string, FacetOption>(
    licenses.map((license) => [
      license.key,
      {
        description: license.url,
        label: license.name,
        value: license.key,
      },
    ]),
  );

  for (const value of selected) {
    if (!options.has(value)) options.set(value, { value });
  }

  return [...options.values()].sort((a, b) =>
    (a.label ?? a.value).localeCompare(b.label ?? b.value),
  );
}

export function buildTagOptions({
  categories,
}: {
  categories: CategoryFilterTag[];
}): TagFacetOption[] {
  return [
    ...uniqueCategories(categories)
      .filter((category) => isProjectCategoryTag(category.slug))
      .map(
        (category): TagFacetOption => ({
          description: category.description,
          kind: 'category',
          label: category.name,
          value: category.slug,
        }),
      ),
  ];
}

export function selectedCategoriesToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `category:${value}`);
}

export function selectedLoadersToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `loader:${value}`);
}

export function selectedLicensesToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `license:${value}`);
}

export function selectedVersionsToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `version:${value}`);
}

function uniqueCategories(
  categories: CategoryFilterTag[],
): CategoryFilterTag[] {
  return [
    ...new Map(
      categories.map((category) => [category.slug, category]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));
}
