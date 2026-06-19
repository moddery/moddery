import { type DependencyKind } from '@moddery/shared';

import { type DashboardData } from '../../../../lib/dashboard.ts';
import { type DependencyDraft } from './useVersionDependencyFormState.ts';
import { DependencyTargetFields } from './DependencyTargetFields.tsx';

export function DependencyFields({
  dependencies,
  disabled,
  projects,
  onAddDependency,
  onRemoveDependency,
  onUpdateDependency,
}: {
  dependencies: DependencyDraft[];
  disabled?: boolean;
  projects: DashboardData['projects'];
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
              disabled={disabled}
              onClick={() => onRemoveDependency(dependency.key)}
              className="inline-flex h-8 items-center rounded-md border border-line bg-control px-3 text-xs font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          </div>
          <label className="grid gap-1 text-sm font-bold text-ink">
            Dependency kind
            <select
              disabled={disabled}
              value={dependency.dependencyKind}
              onChange={(event) =>
                onUpdateDependency(dependency.key, {
                  dependencyKind: event.target.value as DependencyKind,
                })
              }
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="REQUIRED">Required</option>
              <option value="OPTIONAL">Optional</option>
              <option value="INCOMPATIBLE">Incompatible</option>
              <option value="EMBEDDED">Embedded</option>
            </select>
          </label>
          <DependencyTargetFields
            dependency={dependency}
            disabled={disabled}
            projects={projects}
            onUpdateDependency={onUpdateDependency}
          />
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={onAddDependency}
        className="inline-flex h-10 w-fit items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        Add dependency
      </button>
    </div>
  );
}
