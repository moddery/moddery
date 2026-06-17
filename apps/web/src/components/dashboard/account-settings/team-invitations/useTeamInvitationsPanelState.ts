import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  acceptTeamInvitation,
  declineTeamInvitation,
  fetchViewerTeamInvitationSearch,
} from '../../../../lib/dashboard.ts';
import { type TeamInvitationSummary } from '../../../../lib/dashboard/types.ts';

export const teamInvitationPageSize = 20;

export function useTeamInvitationsPanelState() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const invitationsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerTeamInvitationSearch(page, teamInvitationPageSize, signal),
    queryKey: ['dashboard', 'team-invitations', page],
  });
  const invitations = invitationsQuery.data?.invitations ?? [];
  const totalHits = invitationsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / teamInvitationPageSize));

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

  return {
    acceptInvitation: (invitationId: string) =>
      act(invitationId, acceptTeamInvitation),
    busyId,
    declineInvitation: (invitationId: string) =>
      act(invitationId, declineTeamInvitation),
    invitations,
    invitationsQuery,
    message,
    page,
    setPage,
    totalHits,
    totalPages,
  };
}
