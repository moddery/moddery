import { organizationPath } from '../../../../app/routing.ts';
import { type TeamInvitationSummary } from '../../../../lib/dashboard/types.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { permissionLabel } from '../../../../lib/permissions.ts';
import { projectTypeFromKind } from '../../../../lib/projectTypes.ts';
import { projectPath } from '../../../mod-card/ModCardParts.tsx';

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
  const targetHref = teamInvitationTargetHref(invitation.target);

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {targetHref ? (
            <a
              href={targetHref}
              className="font-bold text-ink transition-colors hover:text-accent"
            >
              {invitation.target.name}
            </a>
          ) : (
            <h3 className="font-bold text-ink">{invitation.target.name}</h3>
          )}
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

export function teamInvitationTargetHref(
  target: TeamInvitationSummary['target'],
) {
  if (target.type === 'ORGANIZATION') {
    return organizationPath(target.slug);
  }

  if (target.projectKind === null || target.slug.trim() === '') {
    return null;
  }

  return projectPath(projectTypeFromKind(target.projectKind), target.slug);
}
