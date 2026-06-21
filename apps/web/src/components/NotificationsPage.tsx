import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  fetchViewerNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/notifications.ts';
import { NotificationEmptyState } from './notifications/NotificationEmptyState.tsx';
import { NotificationsFilters } from './notifications/NotificationsFilters.tsx';
import { NotificationsList } from './notifications/NotificationsList.tsx';
import { NotificationsSkeleton } from './notifications/NotificationsSkeleton.tsx';
import {
  allTypesFilter,
  buildTypeOptions,
} from './notifications/notificationTypeOptions.ts';

const pageSize = 20;

export function NotificationsPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [type, setType] = useState(allTypesFilter);
  const selectedType = type === allTypesFilter ? null : type;

  useEffect(() => {
    setPage(1);
  }, [selectedType, unreadOnly]);

  const notificationsQuery = useQuery({
    queryFn: () =>
      fetchViewerNotifications({
        limit: pageSize,
        page,
        type: selectedType,
        unreadOnly,
      }),
    queryKey: ['notifications', 'viewer', selectedType, unreadOnly, page],
  });
  const notifications =
    notificationsQuery.data?.viewerNotificationSearch.notifications ?? [];
  const totalHits =
    notificationsQuery.data?.viewerNotificationSearch.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));
  const unreadCount = notificationsQuery.data?.unreadNotificationCount ?? 0;
  const notificationTypes =
    notificationsQuery.data?.viewerNotificationTypes ?? [];
  const typeOptions = buildTypeOptions(notificationTypes);
  const hasNotifications = notificationsQuery.data !== undefined;
  const hasFilterControls = hasNotifications && notificationTypes.length > 0;
  const hasActiveFilters = unreadOnly || selectedType !== null;

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

      {hasFilterControls && (
        <NotificationsFilters
          notificationCount={notifications.length}
          totalHits={totalHits}
          type={type}
          typeOptions={typeOptions}
          unreadOnly={unreadOnly}
          onTypeChange={setType}
          onUnreadOnlyChange={setUnreadOnly}
        />
      )}

      {notificationsQuery.isLoading ? (
        <NotificationsSkeleton />
      ) : notificationsQuery.error ? (
        <p className="mt-5 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {notificationsQuery.error instanceof Error
            ? notificationsQuery.error.message
            : 'Notifications failed to load'}
        </p>
      ) : !hasNotifications ? (
        <p className="mt-5 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Notifications did not return from the API.
        </p>
      ) : notifications.length === 0 ? (
        <NotificationEmptyState
          filtered={hasActiveFilters}
          onClear={() => {
            setUnreadOnly(false);
            setType(allTypesFilter);
          }}
        />
      ) : (
        <NotificationsList
          notifications={notifications}
          page={page}
          totalPages={totalPages}
          onPage={setPage}
          onRead={markOneRead}
        />
      )}

      {message && (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {message}
        </p>
      )}
    </main>
  );
}
