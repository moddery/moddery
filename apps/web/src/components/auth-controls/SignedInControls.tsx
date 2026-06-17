import { controlButton } from './styles.ts';
import { NotificationsMenu } from './NotificationsMenu.tsx';
import { type NotificationItem } from './types.ts';

export function SignedInControls({
  isAdmin,
  notifications,
  notificationCount,
  onLogout,
  onNotificationRead,
  username,
}: {
  isAdmin?: boolean;
  notifications: NotificationItem[];
  notificationCount: number;
  onLogout: () => Promise<void>;
  onNotificationRead: (id: string) => Promise<void>;
  username?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <a
        href={username ? `/users/${username}` : undefined}
        className="hidden text-sm font-semibold text-muted transition-colors hover:text-ink sm:inline"
      >
        {username ?? 'Signed in'}
        {isAdmin ? ' · admin' : ''}
      </a>
      <NotificationsMenu
        count={notificationCount}
        notifications={notifications}
        onRead={onNotificationRead}
      />
      <button type="button" className={controlButton} onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}
