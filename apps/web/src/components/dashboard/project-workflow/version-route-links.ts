import { type ProjectKind } from '@moddery/shared';

import { projectPath } from '../../../app/routing.ts';
import { projectTypeFromKind } from '../../../lib/projectTypes.ts';

export interface WorkflowProjectRouteTarget {
  kind: ProjectKind;
  slug: string;
}

export interface WorkflowVersionRouteTarget {
  versionNumber: string;
}

export function workflowProjectHref(project: WorkflowProjectRouteTarget) {
  return projectPath(projectTypeFromKind(project.kind), project.slug);
}

export function workflowVersionHref(
  project: WorkflowProjectRouteTarget,
  version: WorkflowVersionRouteTarget,
) {
  return `${workflowProjectHref(project)}&tab=versions&version=${encodeURIComponent(version.versionNumber)}`;
}
