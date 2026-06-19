import { apolloClient } from '../../../../apollo.js';
import {
  CONFIRM_EMAIL_VERIFICATION_MUTATION,
  REQUEST_EMAIL_VERIFICATION_MUTATION,
  UPDATE_VIEWER_PROFILE_MUTATION,
} from '../../graphql.js';
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

export async function requestEmailVerification(): Promise<boolean> {
  const { data } = await apolloClient.mutate<{
    requestEmailVerification: boolean;
  }>({
    mutation: REQUEST_EMAIL_VERIFICATION_MUTATION,
  });

  if (data?.requestEmailVerification !== true) {
    throw new Error('Email verification request failed');
  }

  return true;
}

export async function confirmEmailVerification(
  token: string,
): Promise<boolean> {
  const { data } = await apolloClient.mutate<
    { confirmEmailVerification: boolean },
    { input: { token: string } }
  >({
    mutation: CONFIRM_EMAIL_VERIFICATION_MUTATION,
    variables: { input: { token } },
  });

  if (data?.confirmEmailVerification !== true) {
    throw new Error('Email verification failed');
  }

  return true;
}
