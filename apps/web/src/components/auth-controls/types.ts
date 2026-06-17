import { type NotificationItem } from '../../lib/notifications.ts';

export interface MeQueryData {
  me: {
    isAdmin: boolean;
    username: string;
  };
}

export interface AuthMutationData {
  login?: {
    accessToken: string;
  };
  register?: {
    accessToken: string;
  };
}

export interface NotificationsQueryData {
  unreadNotificationCount: number;
  viewerNotifications: NotificationItem[];
}

export type { NotificationItem };

export type AuthMode = 'login' | 'register';
