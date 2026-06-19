import { type AdminAuditLog } from '../../../lib/dashboard.ts';
import { timeAgo } from '../../../lib/format.ts';
import { enumLabel } from '../../../lib/labels.ts';
import { AuditDescription } from './AuditLogDescription.tsx';
import { AuditSnapshotGrid } from './AuditLogSnapshots.tsx';

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
