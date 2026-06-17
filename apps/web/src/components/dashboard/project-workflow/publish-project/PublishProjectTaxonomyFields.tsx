import { type CreateProjectInput } from '../../../../lib/dashboard.ts';
import { DashboardField } from '../shared.tsx';
import { type PublishProjectFieldsProps } from './PublishProjectFields.types.ts';

type TaxonomyFieldsProps = Pick<
  PublishProjectFieldsProps,
  | 'categories'
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
  gameVersions,
  kind,
  loaders,
  onCategoriesChange,
  onGameVersionsChange,
  onKindChange,
  onLoadersChange,
}: TaxonomyFieldsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
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
      <DashboardField
        label="Loaders"
        value={loaders}
        onChange={onLoadersChange}
      />
      <DashboardField
        label="Game versions"
        value={gameVersions}
        onChange={onGameVersionsChange}
      />
      <DashboardField
        label="Categories"
        value={categories}
        onChange={onCategoriesChange}
      />
    </div>
  );
}
