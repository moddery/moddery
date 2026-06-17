import { gql } from '@apollo/client';

import { apolloClient } from '../apollo.ts';

export interface NotificationItem {
  actionUrl: string | null;
  body: string | null;
  createdAt: string;
  deliveries: NotificationDelivery[];
  id: string;
  readAt: string | null;
  state: string;
  title: string;
  type: string;
}

export interface NotificationDelivery {
  attempts: number;
  channel: string;
  id: string;
  lastError: string | null;
  scheduledAt: string;
  sentAt: string | null;
  state: string;
}

export interface NotificationsQueryData {
  unreadNotificationCount: number;
  viewerNotifications: NotificationItem[];
}

export const NOTIFICATIONS_QUERY = gql`
  query ViewerNotifications {
    unreadNotificationCount
    viewerNotifications {
      actionUrl
      body
      createdAt
      deliveries {
        attempts
        channel
        id
        lastError
        scheduledAt
        sentAt
        state
      }
      id
      readAt
      state
      title
      type
    }
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: String!) {
    markNotificationRead(id: $id) {
      id
      readAt
      state
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export async function fetchViewerNotifications(signal?: AbortSignal) {
  const { data } = await apolloClient.query<NotificationsQueryData>({
    context: {
      fetchOptions: { signal },
    },
    fetchPolicy: 'network-only',
    query: NOTIFICATIONS_QUERY,
  });

  return data;
}

export async function markNotificationRead(id: string) {
  await apolloClient.mutate({
    mutation: MARK_NOTIFICATION_READ_MUTATION,
    variables: { id },
  });
}

export async function markAllNotificationsRead() {
  const { data } = await apolloClient.mutate<{
    markAllNotificationsRead: number;
  }>({
    mutation: MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  });

  return data?.markAllNotificationsRead ?? 0;
}
