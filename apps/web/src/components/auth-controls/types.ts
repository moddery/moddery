import {
  type NotificationItem,
  type NotificationsQueryData,
} from '../../lib/notifications.ts';

export interface MeQueryData {
  me: {
    isAdmin: boolean;
    username: string;
  };
}

export interface AuthMutationData {
  confirmPasswordReset?: boolean;
  login?: {
    accessToken: string;
  };
  register?: {
    accessToken: string;
  };
  requestPasswordReset?: boolean;
}

export type { NotificationItem, NotificationsQueryData };

export type AuthMode = 'login' | 'register' | 'reset-request' | 'reset-confirm';
