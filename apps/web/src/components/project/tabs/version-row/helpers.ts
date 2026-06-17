import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { projectTypeFromKind } from '../../../../lib/projectTypes.ts';
import { projectPath } from '../../../mod-card/ModCardParts.tsx';

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

export function dependencyProjectHref(
  dependency: ProjectVersion['dependencies'][number],
): string | null {
  if (dependency.targetProject === null) return null;

  return projectPath(
    projectTypeFromKind(dependency.targetProject.kind),
    dependency.targetProject.slug,
  );
}
