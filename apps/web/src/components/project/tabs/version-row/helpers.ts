import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { projectTypeFromKind } from '../../../../lib/projectTypes.ts';
import { projectPath } from '../../../../app/routing.ts';

export function shortHash(value: string): string {
  return value.length <= 12 ? value : `${value.slice(0, 12)}...`;
}

export function dependencyLabel(
  dependency: ProjectVersion['dependencies'][number],
) {
  return `${dependency.dependencyKind.toLowerCase()}: ${dependencyTargetLabel(
    dependency,
  )}`;
}

export function dependencyTargetLabel(
  dependency: ProjectVersion['dependencies'][number],
) {
  const projectTitle = dependency.targetProject?.title;
  const versionNumber = dependency.targetVersion?.versionNumber;

  if (projectTitle && versionNumber) {
    return `${projectTitle} version ${versionNumber}`;
  }

  return (
    projectTitle ??
    versionNumber ??
    dependency.externalFileName ??
    'External file'
  );
}

export function dependencyProjectHref(
  dependency: ProjectVersion['dependencies'][number],
): string | null {
  if (dependency.targetProject === null) return null;

  const href = projectPath(
    projectTypeFromKind(dependency.targetProject.kind),
    dependency.targetProject.slug,
  );

  if (dependency.targetVersion === null) return href;

  return `${href}&tab=versions&version=${encodeURIComponent(
    dependency.targetVersion.versionNumber,
  )}`;
}

export function versionHref(versionNumber: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', 'versions');
  url.searchParams.set('version', versionNumber);

  return `${url.pathname}${url.search}${url.hash}`;
}
