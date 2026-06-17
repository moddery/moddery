import { Pagination } from '../../Pagination.tsx';
import { TeamInvitationRow } from './team-invitations/TeamInvitationRow.tsx';
import { useTeamInvitationsPanelState } from './team-invitations/useTeamInvitationsPanelState.ts';

export function TeamInvitationsPanel() {
  const state = useTeamInvitationsPanelState();

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
        {state.message && (
          <span className="text-sm font-semibold text-muted">
            {state.message}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        {state.invitationsQuery.isLoading ? (
          <p className="text-sm text-muted">Loading invitations...</p>
        ) : state.invitations.length === 0 ? (
          <p className="text-sm text-muted">No pending team invitations.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-muted">
                Showing {state.invitations.length.toLocaleString('en-US')} of{' '}
                {state.totalHits.toLocaleString('en-US')} pending invitations
              </p>
              {state.totalPages > 1 && (
                <Pagination
                  page={state.page}
                  totalPages={state.totalPages}
                  onPage={state.setPage}
                />
              )}
            </div>
            {state.invitations.map((invitation) => (
              <TeamInvitationRow
                busy={state.busyId === invitation.id}
                invitation={invitation}
                key={invitation.id}
                onAccept={state.acceptInvitation}
                onDecline={state.declineInvitation}
              />
            ))}
            {state.totalPages > 1 && (
              <div className="flex justify-end">
                <Pagination
                  page={state.page}
                  totalPages={state.totalPages}
                  onPage={state.setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
