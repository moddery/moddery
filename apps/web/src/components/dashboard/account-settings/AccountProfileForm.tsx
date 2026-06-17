import { UserRound } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

import {
  updateViewerProfile,
  type DashboardData,
  type UpdateViewerProfileInput,
} from '../../../lib/dashboard.ts';
import { DashboardField } from './shared.tsx';

export function AccountProfileForm({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(dashboard.displayName ?? '');
  const [bio, setBio] = useState(dashboard.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(dashboard.avatarUrl ?? '');
  const [email, setEmail] = useState(dashboard.email ?? '');
  const [newsletterOptIn, setNewsletterOptIn] = useState(
    dashboard.newsletterOptIn,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(dashboard.displayName ?? '');
    setBio(dashboard.bio ?? '');
    setAvatarUrl(dashboard.avatarUrl ?? '');
    setEmail(dashboard.email ?? '');
    setNewsletterOptIn(dashboard.newsletterOptIn);
  }, [
    dashboard.avatarUrl,
    dashboard.bio,
    dashboard.displayName,
    dashboard.email,
    dashboard.newsletterOptIn,
  ]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const input: UpdateViewerProfileInput = {
      avatarUrl,
      bio,
      displayName,
      email,
      newsletterOptIn,
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
            <DashboardField
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-2 rounded-lg border border-line bg-surface p-3 text-sm">
            <label className="flex items-center gap-2 font-bold text-ink">
              <input
                type="checkbox"
                checked={newsletterOptIn}
                onChange={(event) => setNewsletterOptIn(event.target.checked)}
                className="size-4 accent-accent"
              />
              Newsletter opt-in
            </label>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted">
              <span>
                Email{' '}
                {dashboard.emailVerifiedAt
                  ? `verified ${new Date(
                      dashboard.emailVerifiedAt,
                    ).toLocaleDateString('en-US')}`
                  : 'not verified'}
              </span>
              <span>·</span>
              <span>
                Two-factor authentication{' '}
                {dashboard.twoFactorEnabled ? 'enabled' : 'disabled'}
              </span>
            </div>
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
