import { type AdminAuditLog } from '../../../lib/dashboard.ts';
import { auditUserHref, projectAuditSnapshotHref } from './audit-log-links.ts';

export function AuditSnapshotGrid({ auditLog }: { auditLog: AdminAuditLog }) {
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
      {(auditLog.reportBefore || auditLog.reportAfter) && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <ReportAuditSnapshot
            label="Before"
            snapshot={auditLog.reportBefore}
          />
          <ReportAuditSnapshot label="After" snapshot={auditLog.reportAfter} />
        </dl>
      )}
    </>
  );
}

function ReportAuditSnapshot({
  label,
  snapshot,
}: {
  label: string;
  snapshot: AdminAuditLog['reportAfter'];
}) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2">
      <dt className="text-xs font-bold uppercase text-faint">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">
        {snapshot
          ? `${snapshot.targetLabel} / ${snapshot.state}`
          : 'Unavailable'}
      </dd>
      {snapshot && (
        <dd className="mt-1 text-xs font-semibold text-muted">
          {snapshot.targetKind} report · {snapshot.reason}
        </dd>
      )}
    </div>
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

function projectSnapshotText(
  snapshot: NonNullable<AdminAuditLog['projectAfter']>,
) {
  return `${snapshot.title} / ${snapshot.status}${
    snapshot.requestedStatus ? ` -> ${snapshot.requestedStatus}` : ''
  }`;
}
