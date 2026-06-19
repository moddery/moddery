import {
  organizationPath,
  projectPath,
  userPath,
} from '../../../app/routing.ts';
import {
  type AdminAuditLog,
  type AdminAuditUser,
  type AuditResourceSnapshot,
} from '../../../lib/dashboard.ts';
import { projectTypeFromKind } from '../../../lib/projectTypes.ts';

export function auditUserHref(user: Pick<AdminAuditUser, 'username'>) {
  return userPath(user.username);
}

export function auditResourceHref(resource: AuditResourceSnapshot | null) {
  if (resource?.kind === 'ORGANIZATION') {
    return organizationPath(resource.slug);
  }

  if (resource?.kind === 'PROJECT' && resource.projectKind !== null) {
    return projectPath(
      projectTypeFromKind(resource.projectKind),
      resource.slug,
    );
  }

  return null;
}

export function projectAuditSnapshotHref(
  snapshot: Pick<
    NonNullable<AdminAuditLog['projectAfter']>,
    'projectKind' | 'slug'
  >,
) {
  if (snapshot.projectKind === null) {
    return null;
  }

  return projectPath(projectTypeFromKind(snapshot.projectKind), snapshot.slug);
}
