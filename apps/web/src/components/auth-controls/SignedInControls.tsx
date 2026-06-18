import { userPath } from '../../app/routing.ts';
import { controlButton } from './styles.ts';
import { NotificationsMenu } from './NotificationsMenu.tsx';
import { type NotificationItem } from './types.ts';

export function SignedInControls({
  isAdmin,
  notifications,
  notificationCount,
  onLogout,
  onOpenNotifications,
  onOpenProfile,
  onNotificationRead,
  username,
}: {
  isAdmin?: boolean;
  notifications: NotificationItem[];
  notificationCount: number;
  onLogout: () => Promise<void>;
  onOpenNotifications?: () => void;
  onOpenProfile?: (username: string) => void;
  onNotificationRead: (id: string) => Promise<void>;
  username?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <a
        href={username ? userPath(username) : undefined}
        onClick={(event) => {
          if (!username || !onOpenProfile) return;
          if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          event.preventDefault();
          onOpenProfile(username);
        }}
        className="hidden text-sm font-semibold text-muted transition-colors hover:text-ink sm:inline"
      >
        {username ?? 'Signed in'}
        {isAdmin ? ' · admin' : ''}
      </a>
      <NotificationsMenu
        count={notificationCount}
        notifications={notifications}
        onOpenInbox={onOpenNotifications}
        onRead={onNotificationRead}
      />
      <button type="button" className={controlButton} onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}
