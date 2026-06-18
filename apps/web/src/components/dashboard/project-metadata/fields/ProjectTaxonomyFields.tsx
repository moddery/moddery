import { SUPPORTED_LOADERS } from '@moddery/shared';

import { enumLabel } from '../../../../lib/labels.ts';
import { TaxonomyCheckboxGroup } from '../../TaxonomyCheckboxGroup.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectTaxonomyFields({
  categories,
  categoryOptions,
  gameVersionOptions,
  gameVersions,
  loaders,
  onCategoriesChange,
  onGameVersionsChange,
  onLoadersChange,
  projectSlug,
  projects,
}: Pick<
  ProjectMetadataFieldsProps,
  | 'categories'
  | 'categoryOptions'
  | 'gameVersionOptions'
  | 'gameVersions'
  | 'loaders'
  | 'onCategoriesChange'
  | 'onGameVersionsChange'
  | 'onLoadersChange'
  | 'projectSlug'
  | 'projects'
>) {
  const selectedProject = projects.find(
    (project) => project.slug === projectSlug,
  );
  const filteredCategories = categoryOptions.filter(
    (category) =>
      category.projectKind === null ||
      category.projectKind === selectedProject?.kind,
  );
  const activeGameVersions = gameVersionOptions.filter(
    (version) => version.isActive,
  );

  return (
    <div className="grid gap-3">
      <TaxonomyCheckboxGroup
        label="Loaders"
        options={SUPPORTED_LOADERS.map((loader) => ({
          label: enumLabel(loader),
          value: loader,
        }))}
        selected={loaders}
        onChange={onLoadersChange}
      />
      <TaxonomyCheckboxGroup
        label="Game versions"
        options={activeGameVersions.map((version) => ({
          label: version.version,
          value: version.version,
        }))}
        selected={gameVersions}
        onChange={onGameVersionsChange}
      />
      <TaxonomyCheckboxGroup
        label="Categories"
        options={filteredCategories.map((category) => ({
          label: category.name,
          value: category.slug,
        }))}
        selected={categories}
        onChange={onCategoriesChange}
      />
    </div>
  );
}
