import { Pagination } from '../../Pagination.tsx';
import {
  DashboardPanel,
  PanelEmptyState,
  SectionHeader,
} from '../../ui/dashboard/index.ts';
import { TeamInvitationRow } from './team-invitations/TeamInvitationRow.tsx';
import { useTeamInvitationsPanelState } from './team-invitations/useTeamInvitationsPanelState.ts';

export function TeamInvitationsPanel() {
  const state = useTeamInvitationsPanelState();

  return (
    <div id="dashboard-team-invitations" className="scroll-mt-32">
      <DashboardPanel>
        <SectionHeader
          title="Team invitations"
          description="Review project and organization team invitations."
          action={
            state.message ? (
              <span className="text-sm font-semibold text-muted">
                {state.message}
              </span>
            ) : undefined
          }
        />

        <div className="mt-4 grid gap-3">
          {state.invitationsQuery.isLoading ? (
            <p className="text-sm text-muted">Loading invitations...</p>
          ) : state.invitations.length === 0 ? (
            <PanelEmptyState title="No pending team invitations." />
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
      </DashboardPanel>
    </div>
  );
}
