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

export interface NotificationItem {
  actionUrl: string | null;
  body: string | null;
  createdAt: string;
  id: string;
  readAt: string | null;
  state: string;
  title: string;
  type: string;
}

export type AuthMode = 'login' | 'register';
