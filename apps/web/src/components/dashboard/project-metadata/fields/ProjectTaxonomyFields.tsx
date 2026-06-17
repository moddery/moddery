import { DashboardField } from '../shared.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectTaxonomyFields({
  categories,
  gameVersions,
  loaders,
  onCategoriesChange,
  onGameVersionsChange,
  onLoadersChange,
}: Pick<
  ProjectMetadataFieldsProps,
  | 'categories'
  | 'gameVersions'
  | 'loaders'
  | 'onCategoriesChange'
  | 'onGameVersionsChange'
  | 'onLoadersChange'
>) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
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
