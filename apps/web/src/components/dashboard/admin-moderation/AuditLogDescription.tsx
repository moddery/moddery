import {
  type AdminAuditLog,
  type AdminAuditUser,
} from '../../../lib/dashboard.ts';
import { enumLabel } from '../../../lib/labels.ts';
import { auditResourceHref, auditUserHref } from './audit-log-links.ts';

export function AuditDescription({ auditLog }: { auditLog: AdminAuditLog }) {
  if (auditLog.action === 'PROJECT_MODERATED') {
    const projectTitle =
      auditLog.projectAfter?.title ??
      auditLog.projectBefore?.title ??
      'project';
    const moderationAction = auditLog.moderationAction
      ? enumLabel(auditLog.moderationAction).toLowerCase()
      : 'moderated';

    return (
      <>
        <AuditUserLink
          fallback={auditLog.actorId ?? 'Unknown actor'}
          user={auditLog.actor}
        />{' '}
        {moderationAction} {projectTitle}
      </>
    );
  }

  if (auditLog.action === 'TEAM_MEMBERSHIP_CHANGED') {
    const memberAction = auditLog.teamMemberAction
      ? enumLabel(auditLog.teamMemberAction).toLowerCase()
      : 'changed';

    return (
      <>
        <AuditUserLink
          fallback={auditLog.actorId ?? 'Unknown actor'}
          user={auditLog.actor}
        />{' '}
        {memberAction}{' '}
        <AuditUserLink
          fallback={auditLog.targetUserId ?? 'a user'}
          user={auditLog.targetUser}
        />{' '}
        on <AuditResourceLink resource={auditLog.resource} />
      </>
    );
  }

  return (
    <>
      <AuditUserLink
        fallback={auditLog.actorId ?? 'Unknown actor'}
        user={auditLog.actor}
      />{' '}
      changed{' '}
      <AuditUserLink
        fallback={auditLog.targetUserId ?? 'a user'}
        user={auditLog.targetUser}
      />
    </>
  );
}

function AuditUserLink({
  fallback,
  user,
}: {
  fallback: string;
  user: AdminAuditUser | null;
}) {
  if (!user) return fallback;

  return (
    <a
      className="font-semibold text-ink transition-colors hover:text-accent"
      href={auditUserHref(user)}
    >
      {user.displayName ?? user.username}
    </a>
  );
}

function AuditResourceLink({
  resource,
}: {
  resource: AdminAuditLog['resource'];
}) {
  const href = auditResourceHref(resource);

  if (!href) return resource?.name ?? 'a team';

  return (
    <a
      className="font-semibold text-ink transition-colors hover:text-accent"
      href={href}
    >
      {resource?.name}
    </a>
  );
}
