import { apolloClient } from '../../../../apollo.js';
import {
  ACCEPT_TEAM_INVITATION_MUTATION,
  DECLINE_TEAM_INVITATION_MUTATION,
  VIEWER_TEAM_INVITATION_SEARCH_QUERY,
  VIEWER_TEAM_INVITATIONS_QUERY,
} from '../../graphql.js';
import {
  type AcceptTeamInvitationMutationData,
  type DeclineTeamInvitationMutationData,
  type TeamInvitationMutationVariables,
  type ViewerTeamInvitationSearchQueryData,
  type ViewerTeamInvitationSearchQueryVariables,
  type ViewerTeamInvitationsQueryData,
} from '../../internal-types.js';
import {
  type TeamInvitationSearchResult,
  type TeamInvitationSummary,
} from '../../types.js';

export async function fetchViewerTeamInvitations(
  signal?: AbortSignal,
): Promise<TeamInvitationSummary[]> {
  const { data } = await apolloClient.query<ViewerTeamInvitationsQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_TEAM_INVITATIONS_QUERY,
  });

  return data.viewerTeamInvitations;
}

export async function fetchViewerTeamInvitationSearch(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<TeamInvitationSearchResult> {
  const { data } = await apolloClient.query<
    ViewerTeamInvitationSearchQueryData,
    ViewerTeamInvitationSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_TEAM_INVITATION_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  return data.viewerTeamInvitationSearch;
}

export async function acceptTeamInvitation(
  invitationId: string,
): Promise<TeamInvitationSummary> {
  const { data } = await apolloClient.mutate<
    AcceptTeamInvitationMutationData,
    TeamInvitationMutationVariables
  >({
    mutation: ACCEPT_TEAM_INVITATION_MUTATION,
    variables: { invitationId },
  });

  if (!data?.acceptTeamInvitation) {
    throw new Error('Team invitation accept did not return from the API');
  }

  return data.acceptTeamInvitation;
}

export async function declineTeamInvitation(
  invitationId: string,
): Promise<TeamInvitationSummary> {
  const { data } = await apolloClient.mutate<
    DeclineTeamInvitationMutationData,
    TeamInvitationMutationVariables
  >({
    mutation: DECLINE_TEAM_INVITATION_MUTATION,
    variables: { invitationId },
  });

  if (!data?.declineTeamInvitation) {
    throw new Error('Team invitation decline did not return from the API');
  }

  return data.declineTeamInvitation;
}
