import { UserRound } from 'lucide-react';

import { type DashboardData } from '../../../lib/dashboard.ts';
import { AccountStatusMeta } from './profile/AccountStatusMeta.tsx';
import { useAccountProfileFormState } from './profile/useAccountProfileFormState.ts';
import { DashboardField } from './shared.tsx';

export function AccountProfileForm({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  const profile = useAccountProfileFormState({ dashboard, onUpdated });

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
        onSubmit={(event) => void profile.submit(event)}
        className="mt-4 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]"
      >
        <div className="grid size-20 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 text-muted">
          {profile.avatarUrl.trim() ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-7" />
          )}
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardField
              label="Display name"
              value={profile.displayName}
              onChange={profile.setDisplayName}
              placeholder={dashboard.username}
            />
            <DashboardField
              label="Avatar URL"
              value={profile.avatarUrl}
              onChange={profile.setAvatarUrl}
              placeholder="https://..."
            />
            <DashboardField
              label="Email"
              value={profile.email}
              onChange={profile.setEmail}
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-2 rounded-lg border border-line bg-surface p-3 text-sm">
            <label className="flex items-center gap-2 font-bold text-ink">
              <input
                type="checkbox"
                checked={profile.newsletterOptIn}
                onChange={(event) =>
                  profile.setNewsletterOptIn(event.target.checked)
                }
                className="size-4 accent-accent"
              />
              Newsletter opt-in
            </label>
            <AccountStatusMeta dashboard={dashboard} />
            {dashboard.email && !dashboard.emailVerifiedAt && (
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <input
                  value={profile.verificationToken}
                  onChange={(event) =>
                    profile.setVerificationToken(event.target.value)
                  }
                  placeholder="Verification token"
                  className="h-9 rounded-md border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
                />
                <button
                  type="button"
                  disabled={profile.busy}
                  onClick={() => void profile.sendVerification()}
                  className="h-9 rounded-md border border-line bg-control px-3 text-xs font-bold text-ink transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send verification
                </button>
                <button
                  type="button"
                  disabled={profile.busy || profile.verificationToken === ''}
                  onClick={() => void profile.confirmVerification()}
                  className="h-9 rounded-md bg-accent px-3 text-xs font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Verify
                </button>
              </div>
            )}
          </div>

          <label className="block text-sm font-bold text-ink">
            Bio
            <textarea
              value={profile.bio}
              onChange={(event) => profile.setBio(event.target.value)}
              maxLength={1000}
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-line bg-control px-3 py-2 text-sm font-normal text-ink outline-none placeholder:text-faint focus-visible:border-accent"
              placeholder="Short public profile bio"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={profile.busy}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save profile
            </button>
            {profile.message && (
              <span className="text-sm font-semibold text-muted">
                {profile.message}
              </span>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
