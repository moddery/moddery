import { Popover } from '@base-ui-components/react/popover';
import { Bell } from 'lucide-react';

import { cn } from '../../lib/cn.ts';
import { timeAgo } from '../../lib/format.ts';
import { controlButton } from './styles.ts';
import { type NotificationItem } from './types.ts';

export function NotificationsMenu({
  count,
  notifications,
  onOpenInbox,
  onRead,
}: {
  count: number;
  notifications: NotificationItem[];
  onOpenInbox?: () => void;
  onRead: (id: string) => Promise<void>;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        className={cn(
          controlButton,
          'relative grid size-9 place-items-center px-0',
        )}
        aria-label="Notifications"
      >
        <Bell className="size-4 text-accent-icon" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-5 text-white">
            {count}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          sideOffset={10}
          align="end"
          collisionPadding={12}
          className="z-50"
        >
          <Popover.Popup
            className={cn(
              'w-[calc(100vw-1.5rem)] max-w-sm origin-[var(--transform-origin)] rounded-xl border border-line bg-surface p-3 shadow-2xl outline-none',
              'transition-[opacity,transform] duration-150',
              'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
              'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            )}
          >
            <h2 className="px-1 font-display text-sm font-extrabold text-ink">
              Notifications
            </h2>
            <div className="mt-2 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-1 py-6 text-center text-sm text-muted">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void onRead(item.id)}
                    className={cn(
                      'block w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-control-hover',
                      item.readAt === null && 'bg-accent-soft',
                    )}
                  >
                    <span className="block text-sm font-bold text-ink">
                      {item.title}
                    </span>
                    {item.body && (
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted">
                        {item.body}
                      </span>
                    )}
                    <span className="mt-1 block text-xs font-semibold text-faint">
                      {timeAgo(item.createdAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
            <a
              href="/notifications"
              onClick={(event) => {
                if (!onOpenInbox) return;
                event.preventDefault();
                onOpenInbox();
              }}
              className="mt-3 block rounded-md border border-line px-3 py-2 text-center text-sm font-bold text-ink transition-colors hover:bg-control-hover"
            >
              View all notifications
            </a>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
