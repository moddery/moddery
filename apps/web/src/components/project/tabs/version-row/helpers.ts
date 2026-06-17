import { type ProjectVersion } from '../../../../lib/catalog.ts';

export function shortHash(value: string): string {
  return value.length <= 12 ? value : `${value.slice(0, 12)}...`;
}

export function dependencyLabel(
  dependency: ProjectVersion['dependencies'][number],
) {
  const target =
    dependency.targetProject?.title ??
    dependency.targetVersion?.versionNumber ??
    dependency.externalFileName ??
    'External file';
  return `${dependency.dependencyKind.toLowerCase()}: ${target}`;
}
