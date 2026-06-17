import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  acceptTeamInvitation,
  declineTeamInvitation,
  fetchViewerTeamInvitationSearch,
} from '../../../lib/dashboard.ts';
import { type TeamInvitationSummary } from '../../../lib/dashboard/types.ts';
import { timeAgo } from '../../../lib/format.ts';
import { Pagination } from '../../Pagination.tsx';

const pageSize = 20;

export function TeamInvitationsPanel() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const invitationsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerTeamInvitationSearch(page, pageSize, signal),
    queryKey: ['dashboard', 'team-invitations', page],
  });
  const invitations = invitationsQuery.data?.invitations ?? [];
  const totalHits = invitationsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));

  async function act(
    invitationId: string,
    action: (invitationId: string) => Promise<TeamInvitationSummary>,
  ) {
    setBusyId(invitationId);
    setMessage(null);

    try {
      await action(invitationId);
      await invitationsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Team invitation failed',
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8 border-t border-line pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Team invitations
          </h2>
          <p className="mt-1 text-sm text-muted">
            Review project and organization team invitations.
          </p>
        </div>
        {message && (
          <span className="text-sm font-semibold text-muted">{message}</span>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        {invitationsQuery.isLoading ? (
          <p className="text-sm text-muted">Loading invitations...</p>
        ) : invitations.length === 0 ? (
          <p className="text-sm text-muted">No pending team invitations.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-muted">
                Showing {invitations.length.toLocaleString('en-US')} of{' '}
                {totalHits.toLocaleString('en-US')} pending invitations
              </p>
              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPage={setPage}
                />
              )}
            </div>
            {invitations.map((invitation) => (
              <TeamInvitationRow
                busy={busyId === invitation.id}
                invitation={invitation}
                key={invitation.id}
                onAccept={(id) => act(id, acceptTeamInvitation)}
                onDecline={(id) => act(id, declineTeamInvitation)}
              />
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
          </>
        )}
      </div>
    </section>
  );
}

function TeamInvitationRow({
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
              {permission}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
