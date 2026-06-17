import { type DependencyKind } from '@moddery/shared';

import { DashboardField } from '../shared.tsx';
import { type DependencyDraft } from './useVersionDependencyFormState.ts';

export function DependencyFields({
  dependencies,
  onAddDependency,
  onRemoveDependency,
  onUpdateDependency,
}: {
  dependencies: DependencyDraft[];
  onAddDependency: () => void;
  onRemoveDependency: (key: string) => void;
  onUpdateDependency: (
    key: string,
    patch: Partial<Omit<DependencyDraft, 'key'>>,
  ) => void;
}) {
  return (
    <div className="grid gap-3">
      {dependencies.map((dependency, index) => (
        <div
          key={dependency.key}
          className="grid gap-3 rounded-lg border border-line bg-surface px-3 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-extrabold text-ink">
              Dependency {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemoveDependency(dependency.key)}
              className="inline-flex h-8 items-center rounded-md border border-line bg-control px-3 text-xs font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover"
            >
              Remove
            </button>
          </div>
          <label className="grid gap-1 text-sm font-bold text-ink">
            Dependency kind
            <select
              value={dependency.dependencyKind}
              onChange={(event) =>
                onUpdateDependency(dependency.key, {
                  dependencyKind: event.target.value as DependencyKind,
                })
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
              value={dependency.targetProjectSlug}
              onChange={(value) =>
                onUpdateDependency(dependency.key, {
                  targetProjectSlug: value,
                })
              }
            />
            <DashboardField
              label="Target version ID"
              value={dependency.targetVersionId}
              onChange={(value) =>
                onUpdateDependency(dependency.key, {
                  targetVersionId: value,
                })
              }
            />
            <DashboardField
              label="External file"
              value={dependency.externalFileName}
              onChange={(value) =>
                onUpdateDependency(dependency.key, {
                  externalFileName: value,
                })
              }
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAddDependency}
        className="inline-flex h-10 w-fit items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover"
      >
        Add dependency
      </button>
    </div>
  );
}
