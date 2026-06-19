import { apolloClient } from '../../../../apollo.js';
import {
  NOTIFICATION_PREFERENCES_QUERY,
  SEND_NOTIFICATION_MUTATION,
  UPDATE_NOTIFICATION_PREFERENCE_MUTATION,
} from '../../graphql.js';
import {
  type NotificationPreferencesQueryData,
  type SendNotificationMutationData,
  type SendNotificationMutationVariables,
  type UpdateNotificationPreferenceMutationData,
  type UpdateNotificationPreferenceMutationVariables,
} from '../../internal-types.js';
import { type NotificationPreference } from '../../types.js';

export async function fetchNotificationPreferences(
  signal?: AbortSignal,
): Promise<NotificationPreference[]> {
  const { data } = await apolloClient.query<NotificationPreferencesQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: NOTIFICATION_PREFERENCES_QUERY,
  });

  return data.viewerNotificationPreferences;
}

export async function updateNotificationPreference(input: {
  channel: string;
  enabled: boolean;
  type: string;
}): Promise<NotificationPreference> {
  const { data } = await apolloClient.mutate<
    UpdateNotificationPreferenceMutationData,
    UpdateNotificationPreferenceMutationVariables
  >({
    mutation: UPDATE_NOTIFICATION_PREFERENCE_MUTATION,
    variables: { input },
  });

  if (!data?.updateNotificationPreference) {
    throw new Error('Notification preference did not return from the API');
  }

  return data.updateNotificationPreference;
}

export async function sendNotification(input: {
  actionUrl: string | null;
  body: string | null;
  title: string;
  type: string;
  username: string;
}): Promise<SendNotificationMutationData['sendNotification']> {
  const { data } = await apolloClient.mutate<
    SendNotificationMutationData,
    SendNotificationMutationVariables
  >({
    mutation: SEND_NOTIFICATION_MUTATION,
    variables: { input },
  });

  if (!data?.sendNotification) {
    throw new Error('Notification did not return from the API');
  }

  return data.sendNotification;
}
