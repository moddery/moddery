import { useQuery } from '@tanstack/react-query';
import { Bell, UserRound } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

import {
  fetchNotificationPreferences,
  sendNotification,
  updateNotificationPreference,
  updateViewerProfile,
  type DashboardData,
  type NotificationPreference,
  type UpdateViewerProfileInput,
} from '../../lib/dashboard.ts';

export {
  AccountProfileForm,
  NotificationPreferencesPanel,
  SendNotificationPanel,
};

function AccountProfileForm({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(dashboard.displayName ?? '');
  const [bio, setBio] = useState(dashboard.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(dashboard.avatarUrl ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(dashboard.displayName ?? '');
    setBio(dashboard.bio ?? '');
    setAvatarUrl(dashboard.avatarUrl ?? '');
  }, [dashboard.avatarUrl, dashboard.bio, dashboard.displayName]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const input: UpdateViewerProfileInput = {
      avatarUrl,
      bio,
      displayName,
    };

    try {
      await updateViewerProfile(input);
      await onUpdated();
      setMessage('Profile updated.');
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Profile update failed.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Profile
        </h2>
        <span className="text-sm font-semibold text-muted">
          @{dashboard.username}
        </span>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]"
      >
        <div className="grid size-20 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 text-muted">
          {avatarUrl.trim() ? (
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <UserRound className="size-7" />
          )}
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardField
              label="Display name"
              value={displayName}
              onChange={setDisplayName}
              placeholder={dashboard.username}
            />
            <DashboardField
              label="Avatar URL"
              value={avatarUrl}
              onChange={setAvatarUrl}
              placeholder="https://..."
            />
          </div>

          <label className="block text-sm font-bold text-ink">
            Bio
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={1000}
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-line bg-control px-3 py-2 text-sm font-normal text-ink outline-none placeholder:text-faint focus-visible:border-accent"
              placeholder="Short public profile bio"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save profile
            </button>
            {message && (
              <span className="text-sm font-semibold text-muted">
                {message}
              </span>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}

function NotificationPreferencesPanel() {
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
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Notification preferences
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Choose where account, team, and moderation updates are delivered.
          </p>
        </div>
        <Bell className="size-5 text-accent-icon" />
      </div>

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
    </section>
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

function SendNotificationPanel() {
  const [username, setUsername] = useState('');
  const [type, setType] = useState('moderation');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('/dashboard');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const notification = await sendNotification({
        actionUrl: nullableText(actionUrl),
        body: nullableText(body),
        title,
        type,
        username,
      });
      setMessage(`Sent ${notification.title} to ${username}.`);
      setTitle('');
      setBody('');
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Notification failed',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Send notification
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Queue a user notification and delivery records.
          </p>
        </div>
        <Bell className="size-5 text-accent-icon" />
      </div>
      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <DashboardField
            label="Username"
            value={username}
            onChange={setUsername}
            required
          />
          <DashboardField
            label="Type"
            value={type}
            onChange={setType}
            required
          />
          <DashboardField
            label="Action URL"
            value={actionUrl}
            onChange={setActionUrl}
          />
        </div>
        <DashboardField
          label="Title"
          value={title}
          onChange={setTitle}
          required
        />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Body
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send notification
          </button>
          {message && (
            <span className="text-sm font-semibold text-muted">{message}</span>
          )}
        </div>
      </form>
    </section>
  );
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function DashboardField({
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      {label}
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
      />
    </label>
  );
}
