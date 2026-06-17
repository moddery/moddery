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
  viewerNotificationTypes: string[];
  viewerNotificationSearch: {
    notifications: NotificationItem[];
    totalHits: number;
  };
}

export interface NotificationsQueryVariables {
  limit: number;
  offset: number;
  type?: string | null;
  unreadOnly?: boolean | null;
}

export const NOTIFICATIONS_QUERY = gql`
  query ViewerNotifications(
    $type: String
    $unreadOnly: Boolean
    $limit: Int!
    $offset: Int!
  ) {
    unreadNotificationCount
    viewerNotificationTypes
    viewerNotificationSearch(
      type: $type
      unreadOnly: $unreadOnly
      limit: $limit
      offset: $offset
    ) {
      notifications {
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
      totalHits
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

export async function fetchViewerNotifications(
  filters: {
    limit?: number;
    page?: number;
    type?: string | null;
    unreadOnly?: boolean | null;
  } = {},
  signal?: AbortSignal,
) {
  const normalizedType = filters.type?.trim().toLowerCase() ?? '';
  const limit = filters.limit ?? 20;
  const page = filters.page ?? 1;
  const { data } = await apolloClient.query<
    NotificationsQueryData,
    NotificationsQueryVariables
  >({
    context: {
      fetchOptions: { signal },
    },
    fetchPolicy: 'network-only',
    query: NOTIFICATIONS_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      type: normalizedType.length === 0 ? null : normalizedType,
      unreadOnly: filters.unreadOnly ?? null,
    },
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
