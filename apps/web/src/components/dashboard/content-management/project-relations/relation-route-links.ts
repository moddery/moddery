import { type CollectionVisibility, type ProjectKind } from '@moddery/shared';

import {
  collectionPath,
  organizationPath,
  projectPath,
} from '../../../../app/routing.ts';
import { projectTypeFromKind } from '../../../../lib/projectTypes.ts';

export interface RelationCollectionTarget {
  slug: string;
  visibility: CollectionVisibility;
}

export interface RelationOrganizationTarget {
  slug: string;
}

export interface RelationProjectTarget {
  kind: ProjectKind;
  slug: string;
}

export function relationCollectionHref(
  collection: RelationCollectionTarget,
  ownerUsername: string,
) {
  return collection.visibility === 'PRIVATE'
    ? null
    : collectionPath({ ownerUsername, slug: collection.slug });
}

export function relationOrganizationHref(
  organization: RelationOrganizationTarget,
) {
  return organizationPath(organization.slug);
}

export function relationProjectHref(project: RelationProjectTarget) {
  return projectPath(projectTypeFromKind(project.kind), project.slug);
}
