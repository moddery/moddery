import {
  type AdminAuditLog,
  type AdminAuditUser,
} from '../../../lib/dashboard.ts';
import { timeAgo } from '../../../lib/format.ts';
import { enumLabel } from '../../../lib/labels.ts';
import {
  auditResourceHref,
  auditUserHref,
  projectAuditSnapshotHref,
} from './audit-log-links.ts';

export function AuditLogEventCard({ auditLog }: { auditLog: AdminAuditLog }) {
  return (
    <article className="rounded-lg border border-line bg-surface-2 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-ink">
            {enumLabel(auditLog.action)}
          </h3>
          <p className="mt-1 text-sm text-muted">
            <AuditDescription auditLog={auditLog} />{' '}
            {timeAgo(auditLog.createdAt)}
          </p>
          {auditLog.reason && (
            <p className="mt-2 text-sm text-muted">Reason: {auditLog.reason}</p>
          )}
        </div>
        <span className="rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted">
          {enumLabel(auditLog.action)}
        </span>
      </div>

      <AuditSnapshotGrid auditLog={auditLog} />
    </article>
  );
}

function AuditSnapshotGrid({ auditLog }: { auditLog: AdminAuditLog }) {
  return (
    <>
      {(auditLog.before || auditLog.after) && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <UserAccountAuditSnapshot label="Before" snapshot={auditLog.before} />
          <UserAccountAuditSnapshot label="After" snapshot={auditLog.after} />
        </dl>
      )}
      {(auditLog.projectBefore || auditLog.projectAfter) && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <ProjectAuditSnapshot
            label="Before"
            snapshot={auditLog.projectBefore}
          />
          <ProjectAuditSnapshot
            label="After"
            snapshot={auditLog.projectAfter}
          />
        </dl>
      )}
      {(auditLog.teamMemberBefore || auditLog.teamMemberAfter) && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <TeamMemberAuditSnapshot
            label="Before"
            snapshot={auditLog.teamMemberBefore}
          />
          <TeamMemberAuditSnapshot
            label="After"
            snapshot={auditLog.teamMemberAfter}
          />
        </dl>
      )}
    </>
  );
}

function TeamMemberAuditSnapshot({
  label,
  snapshot,
}: {
  label: string;
  snapshot: AdminAuditLog['teamMemberAfter'];
}) {
  const permissions =
    snapshot && snapshot.permissions.length > 0
      ? snapshot.permissions.join(', ')
      : 'No permissions';

  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2">
      <dt className="text-xs font-bold uppercase text-faint">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">
        {snapshot ? (
          <>
            <a
              className="text-ink transition-colors hover:text-accent"
              href={auditUserHref(snapshot)}
            >
              {snapshot.username}
            </a>
            {' / '}
            {snapshot.role}
            {snapshot.owner && ' / Owner'}
          </>
        ) : (
          'Unavailable'
        )}
      </dd>
      {snapshot && (
        <dd className="mt-1 text-xs font-semibold text-muted">
          {snapshot.accepted ? 'Accepted' : 'Invited'} · {permissions}
        </dd>
      )}
    </div>
  );
}

function ProjectAuditSnapshot({
  label,
  snapshot,
}: {
  label: string;
  snapshot: AdminAuditLog['projectAfter'];
}) {
  const href = snapshot ? projectAuditSnapshotHref(snapshot) : null;

  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2">
      <dt className="text-xs font-bold uppercase text-faint">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">
        {snapshot && href !== null ? (
          <a
            className="text-ink transition-colors hover:text-accent"
            href={href}
          >
            {projectSnapshotText(snapshot)}
          </a>
        ) : snapshot ? (
          projectSnapshotText(snapshot)
        ) : (
          'Unavailable'
        )}
      </dd>
      {href !== null && (
        <dd className="mt-1 text-xs font-semibold text-muted">{href}</dd>
      )}
    </div>
  );
}

function UserAccountAuditSnapshot({
  label,
  snapshot,
}: {
  label: string;
  snapshot: AdminAuditLog['after'];
}) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2">
      <dt className="text-xs font-bold uppercase text-faint">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">
        {snapshot ? `${snapshot.role} / ${snapshot.status}` : 'Unavailable'}
      </dd>
    </div>
  );
}

function AuditDescription({ auditLog }: { auditLog: AdminAuditLog }) {
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

function projectSnapshotText(
  snapshot: NonNullable<AdminAuditLog['projectAfter']>,
) {
  return `${snapshot.title} / ${snapshot.status}${
    snapshot.requestedStatus ? ` -> ${snapshot.requestedStatus}` : ''
  }`;
}
