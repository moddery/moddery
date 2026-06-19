import { apolloClient } from '../../../../apollo.js';
import { UPDATE_VIEWER_PROFILE_MUTATION } from '../../graphql.js';
import {
  type UpdateViewerProfileMutationData,
  type UpdateViewerProfileMutationVariables,
} from '../../internal-types.js';
import {
  type UpdateViewerProfileInput,
  type ViewerProfileUpdate,
} from '../../types.js';

export async function updateViewerProfile(
  input: UpdateViewerProfileInput,
): Promise<ViewerProfileUpdate> {
  const { data } = await apolloClient.mutate<
    UpdateViewerProfileMutationData,
    UpdateViewerProfileMutationVariables
  >({
    mutation: UPDATE_VIEWER_PROFILE_MUTATION,
    variables: { input },
  });

  if (
    data?.updateViewerProfile === null ||
    data?.updateViewerProfile === undefined
  ) {
    throw new Error('Profile update did not return a user');
  }

  return data.updateViewerProfile;
}
