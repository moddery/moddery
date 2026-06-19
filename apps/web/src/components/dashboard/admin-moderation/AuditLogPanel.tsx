import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  organizationPath,
  projectPath,
  userPath,
} from '../../../app/routing.ts';
import {
  fetchAdminAuditLogSearch,
  type AdminAuditLog,
  type AdminAuditUser,
  type AuditResourceSnapshot,
} from '../../../lib/dashboard.ts';
import { timeAgo } from '../../../lib/format.ts';
import { enumLabel } from '../../../lib/labels.ts';
import { projectTypeFromKind } from '../../../lib/projectTypes.ts';
import { Pagination } from '../../Pagination.tsx';
import { ReportActionButton } from './shared.tsx';

const auditPageSize = 20;

export function AuditLogPanel() {
  const [page, setPage] = useState(1);
  const auditLogsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchAdminAuditLogSearch(page, auditPageSize, signal),
    queryKey: ['dashboard', 'audit-logs', page],
  });
  const auditLogs = auditLogsQuery.data?.auditLogs ?? [];
  const totalHits = auditLogsQuery.data?.totalHits ?? 0;
  const totalPages = Math.ceil(totalHits / auditPageSize);

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Audit log
          </h2>
          <p className="mt-1 text-sm text-muted">
            Recent administrative account and project moderation changes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-muted">
            {totalHits.toLocaleString('en-US')} events
          </span>
          <ReportActionButton
            disabled={auditLogsQuery.isFetching}
            onClick={() => void auditLogsQuery.refetch()}
          >
            Refresh
          </ReportActionButton>
        </div>
      </div>

      {auditLogsQuery.isLoading ? (
        <p className="mt-4 text-sm text-muted">Loading audit events...</p>
      ) : auditLogsQuery.error ? (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {auditLogsQuery.error instanceof Error
            ? auditLogsQuery.error.message
            : 'Audit events failed to load'}
        </p>
      ) : auditLogs.length === 0 ? (
        <p className="py-8 text-sm text-muted">No audit events yet.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {auditLogs.map((auditLog) => (
            <article
              key={auditLog.id}
              className="rounded-lg border border-line bg-surface-2 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-ink">
                    {auditActionLabel(auditLog.action)}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    <AuditDescription auditLog={auditLog} />{' '}
                    {timeAgo(auditLog.createdAt)}
                  </p>
                  {auditLog.reason && (
                    <p className="mt-2 text-sm text-muted">
                      Reason: {auditLog.reason}
                    </p>
                  )}
                </div>
                <span className="rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted">
                  {enumLabel(auditLog.action)}
                </span>
              </div>
              {(auditLog.before || auditLog.after) && (
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <AuditSnapshot label="Before" snapshot={auditLog.before} />
                  <AuditSnapshot label="After" snapshot={auditLog.after} />
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
            </article>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function TeamMemberAuditSnapshot({
  label,
  snapshot,
}: {
  label: string;
  snapshot: {
    accepted: boolean;
    owner: boolean;
    permissions: string[];
    role: string;
    username: string;
  } | null;
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
              href={userPath(snapshot.username)}
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
  snapshot: {
    projectKind: NonNullable<AdminAuditLog['projectAfter']>['projectKind'];
    requestedStatus: string | null;
    slug: string;
    status: string;
    title: string;
  } | null;
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
            {snapshot.title} / {snapshot.status}
            {snapshot.requestedStatus ? ` -> ${snapshot.requestedStatus}` : ''}
          </a>
        ) : snapshot ? (
          `${snapshot.title} / ${snapshot.status}${snapshot.requestedStatus ? ` -> ${snapshot.requestedStatus}` : ''}`
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

function AuditSnapshot({
  label,
  snapshot,
}: {
  label: string;
  snapshot: {
    role: string;
    status: string;
  } | null;
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

function auditActionLabel(action: string) {
  return enumLabel(action);
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
  resource: AuditResourceSnapshot | null;
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
