import { PackageCheck } from 'lucide-react';

import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { Chip } from '../../../Chips.tsx';
import { dependencyLabel, dependencyProjectHref } from './helpers.ts';

export function VersionDependencies({
  dependencies,
}: {
  dependencies: ProjectVersion['dependencies'];
}) {
  if (dependencies.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-muted">
        <PackageCheck className="size-4 text-accent-icon" />
        Dependencies
      </div>
      <div className="grid gap-2">
        {dependencies.map((dependency) => (
          <DependencyRow key={dependency.id} dependency={dependency} />
        ))}
      </div>
    </div>
  );
}

export function DependencyChip({
  dependency,
}: {
  dependency: ProjectVersion['dependencies'][number];
}) {
  const href = dependencyProjectHref(dependency);
  const label = dependencyLabel(dependency);

  if (href === null) {
    return <Chip>{label}</Chip>;
  }

  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-control-hover hover:text-accent"
    >
      {label}
    </a>
  );
}

function DependencyRow({
  dependency,
}: {
  dependency: ProjectVersion['dependencies'][number];
}) {
  const href = dependencyProjectHref(dependency);
  const target =
    dependency.targetProject?.title ??
    dependency.targetVersion?.versionNumber ??
    dependency.externalFileName ??
    'External file';

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-bold uppercase text-muted">
        {dependency.dependencyKind.toLowerCase()}
      </span>
      {href === null ? (
        <span className="font-semibold text-ink">{target}</span>
      ) : (
        <a
          href={href}
          className="font-semibold text-ink transition-colors hover:text-accent"
        >
          {target}
        </a>
      )}
      {dependency.targetProject !== null && dependency.targetVersion && (
        <span className="text-xs font-semibold text-muted">
          Version {dependency.targetVersion.versionNumber}
        </span>
      )}
    </div>
  );
}
