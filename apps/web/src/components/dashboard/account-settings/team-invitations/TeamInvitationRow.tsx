import { type TeamInvitationSummary } from '../../../../lib/dashboard/types.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { permissionLabel } from '../../../../lib/permissions.ts';

export function TeamInvitationRow({
  busy,
  invitation,
  onAccept,
  onDecline,
}: {
  busy: boolean;
  invitation: TeamInvitationSummary;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink">{invitation.target.name}</h3>
          <p className="mt-1 text-sm font-semibold text-muted">
            {invitation.target.type.toLowerCase().replace('_', ' ')} ·{' '}
            {invitation.role} · invited {timeAgo(invitation.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onAccept(invitation.id)}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-extrabold text-accent-ink transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Accept
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDecline(invitation.id)}
            className="rounded-lg border border-line px-3 py-2 text-sm font-extrabold text-ink transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Decline
          </button>
        </div>
      </div>
      {invitation.permissions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {invitation.permissions.map((permission) => (
            <span
              key={permission}
              className="rounded-md bg-control px-2 py-1 text-xs font-bold text-muted"
            >
              {permissionLabel(permission)}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
