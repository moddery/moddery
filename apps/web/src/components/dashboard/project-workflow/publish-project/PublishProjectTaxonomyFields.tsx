import { SUPPORTED_LOADERS } from '@moddery/shared';
import { type CreateProjectInput } from '../../../../lib/dashboard.ts';
import { enumLabel } from '../../../../lib/labels.ts';
import { TaxonomyCheckboxGroup } from '../../TaxonomyCheckboxGroup.tsx';
import { type PublishProjectFieldsProps } from './PublishProjectFields.types.ts';

type TaxonomyFieldsProps = Pick<
  PublishProjectFieldsProps,
  | 'categories'
  | 'categoryOptions'
  | 'gameVersionOptions'
  | 'gameVersions'
  | 'kind'
  | 'loaders'
  | 'onCategoriesChange'
  | 'onGameVersionsChange'
  | 'onKindChange'
  | 'onLoadersChange'
>;

export function PublishProjectTaxonomyFields({
  categories,
  categoryOptions,
  gameVersionOptions,
  gameVersions,
  kind,
  loaders,
  onCategoriesChange,
  onGameVersionsChange,
  onKindChange,
  onLoadersChange,
}: TaxonomyFieldsProps) {
  const filteredCategories = categoryOptions.filter(
    (category) =>
      category.projectKind === null || category.projectKind === kind,
  );
  const activeGameVersions = gameVersionOptions.filter(
    (version) => version.isActive,
  );

  return (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-bold text-ink">
        Type
        <select
          value={kind}
          onChange={(event) =>
            onKindChange(event.target.value as CreateProjectInput['kind'])
          }
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
        >
          <option value="MOD">Mod</option>
          <option value="MODPACK">Modpack</option>
          <option value="RESOURCE_PACK">Resource Pack</option>
          <option value="SHADER">Shader</option>
          <option value="PLUGIN">Plugin</option>
          <option value="DATAPACK">Data Pack</option>
        </select>
      </label>
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
