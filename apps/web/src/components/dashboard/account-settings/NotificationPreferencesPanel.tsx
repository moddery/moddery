import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useState } from 'react';

import {
  fetchNotificationPreferences,
  updateNotificationPreference,
  type NotificationPreference,
} from '../../../lib/dashboard.ts';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';

export function NotificationPreferencesPanel() {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const preferencesQuery = useQuery({
    queryFn: ({ signal }) => fetchNotificationPreferences(signal),
    queryKey: ['dashboard', 'notification-preferences'],
  });
  const preferences = preferencesQuery.data;

  async function toggle(preference: NotificationPreference) {
    const key = preferenceKey(preference);
    setBusyKey(key);
    setMessage(null);

    try {
      await updateNotificationPreference({
        channel: preference.channel,
        enabled: !preference.enabled,
        type: preference.type,
      });
      await preferencesQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : 'Notification preference update failed',
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <CollapsiblePanel
      title="Notification preferences"
      description="Choose where account, team, and moderation updates are delivered."
      action={<Bell className="size-5 text-accent-icon" />}
    >
      {preferencesQuery.isLoading ? (
        <p className="mt-4 text-sm font-semibold text-muted">
          Loading preferences...
        </p>
      ) : preferencesQuery.error ? (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {preferencesQuery.error instanceof Error
            ? preferencesQuery.error.message
            : 'Notification preferences failed to load'}
        </p>
      ) : preferences === undefined ? (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Notification preferences did not return from the API.
        </p>
      ) : (
        <NotificationPreferenceGrid
          busyKey={busyKey}
          onToggle={toggle}
          preferences={preferences}
        />
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {message}
        </p>
      )}
    </CollapsiblePanel>
  );
}

function NotificationPreferenceGrid({
  busyKey,
  onToggle,
  preferences,
}: {
  busyKey: string | null;
  onToggle: (preference: NotificationPreference) => Promise<void>;
  preferences: NotificationPreference[];
}) {
  return (
    <div className="mt-4 grid gap-2">
      {preferences.map((preference) => {
        const key = preferenceKey(preference);

        return (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-display text-base font-extrabold capitalize text-ink">
                {preference.type}
              </p>
              <p className="mt-1 text-sm font-semibold text-muted">
                {preference.channel === 'EMAIL' ? 'Email' : 'In-app'} updates
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-bold text-ink">
              <input
                type="checkbox"
                checked={preference.enabled}
                disabled={busyKey === key}
                onChange={() => void onToggle(preference)}
                className="size-4 accent-accent"
              />
              {preference.enabled ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        );
      })}
    </div>
  );
}

function preferenceKey(preference: { channel: string; type: string }): string {
  return `${preference.type}:${preference.channel}`;
}
