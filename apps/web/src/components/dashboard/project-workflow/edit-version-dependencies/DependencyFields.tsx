import { type DependencyKind } from '@moddery/shared';

import { DashboardField } from '../shared.tsx';

export function DependencyFields({
  dependencyKind,
  externalFileName,
  targetProjectSlug,
  targetVersionId,
  onDependencyKindChange,
  onExternalFileNameChange,
  onTargetProjectSlugChange,
  onTargetVersionIdChange,
}: {
  dependencyKind: DependencyKind;
  externalFileName: string;
  targetProjectSlug: string;
  targetVersionId: string;
  onDependencyKindChange: (kind: DependencyKind) => void;
  onExternalFileNameChange: (value: string) => void;
  onTargetProjectSlugChange: (value: string) => void;
  onTargetVersionIdChange: (value: string) => void;
}) {
  return (
    <>
      <label className="grid gap-1 text-sm font-bold text-ink">
        Dependency kind
        <select
          value={dependencyKind}
          onChange={(event) =>
            onDependencyKindChange(event.target.value as DependencyKind)
          }
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
        >
          <option value="REQUIRED">Required</option>
          <option value="OPTIONAL">Optional</option>
          <option value="INCOMPATIBLE">Incompatible</option>
          <option value="EMBEDDED">Embedded</option>
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardField
          label="Target project slug"
          value={targetProjectSlug}
          onChange={onTargetProjectSlugChange}
        />
        <DashboardField
          label="Target version ID"
          value={targetVersionId}
          onChange={onTargetVersionIdChange}
        />
        <DashboardField
          label="External file"
          value={externalFileName}
          onChange={onExternalFileNameChange}
        />
      </div>
    </>
  );
}
