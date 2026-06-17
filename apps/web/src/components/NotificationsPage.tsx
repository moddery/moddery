import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useState } from 'react';

import {
  fetchViewerNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/notifications.ts';
import { NotificationRow } from './notifications/NotificationRow.tsx';

export function NotificationsPage() {
  const [message, setMessage] = useState<string | null>(null);
  const notificationsQuery = useQuery({
    queryFn: ({ signal }) => fetchViewerNotifications(signal),
    queryKey: ['notifications', 'viewer'],
  });
  const notifications = notificationsQuery.data?.viewerNotifications;
  const unreadCount = notificationsQuery.data?.unreadNotificationCount ?? 0;

  async function markOneRead(id: string) {
    setMessage(null);
    try {
      await markNotificationRead(id);
      await notificationsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Notification update failed',
      );
    }
  }

  async function markAllRead() {
    setMessage(null);
    try {
      const count = await markAllNotificationsRead();
      await notificationsQuery.refetch();
      setMessage(
        count === 0
          ? 'No unread notifications to update.'
          : `${count.toLocaleString('en-US')} notifications marked read.`,
      );
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Notification update failed',
      );
    }
  }

  return (
    <main className="mx-auto w-full max-w-[960px] px-4 pb-24 pt-5 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Notifications
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Project, team, and moderation updates for your account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0 || notificationsQuery.isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all read
        </button>
      </header>

      {notificationsQuery.isLoading ? (
        <NotificationsSkeleton />
      ) : notificationsQuery.error ? (
        <p className="mt-5 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {notificationsQuery.error instanceof Error
            ? notificationsQuery.error.message
            : 'Notifications failed to load'}
        </p>
      ) : notifications === undefined ? (
        <p className="mt-5 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Notifications did not return from the API.
        </p>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <Bell className="size-6 text-accent-icon" />
          <h2 className="mt-4 font-display text-lg font-bold text-ink">
            No notifications yet
          </h2>
          <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
            Updates about your account and projects will appear here.
          </p>
        </div>
      ) : (
        <section className="mt-2">
          {notifications.map((item) => (
            <NotificationRow key={item.id} item={item} onRead={markOneRead} />
          ))}
        </section>
      )}

      {message && (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {message}
        </p>
      )}
    </main>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="mt-4 grid gap-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="border-b border-line py-4">
          <div className="h-5 w-48 animate-pulse rounded bg-surface-2" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
