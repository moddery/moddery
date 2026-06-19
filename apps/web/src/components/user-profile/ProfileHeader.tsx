import { useState } from 'react';
import { Flag } from 'lucide-react';

import { timeAgo } from '../../lib/format.ts';
import { type PublicUserProfile } from '../../lib/users.ts';
import { CopyLinkButton } from '../CopyLinkButton.tsx';
import { FriendshipAction } from './FriendshipAction.tsx';
import { ProfileAvatar } from './profile-header/ProfileAvatar.tsx';
import { ProfileMessageForm } from './profile-header/ProfileMessageForm.tsx';
import { ProfileReportForm } from './profile-header/ProfileReportForm.tsx';
import { ProfileStats } from './profile-header/ProfileStats.tsx';

export function ProfileHeader({
  profile,
  onRequestAuth,
}: {
  profile: PublicUserProfile;
  onRequestAuth?: () => void;
}) {
  const name = profile.displayName ?? profile.username;
  const [reportOpen, setReportOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <ProfileAvatar avatarUrl={profile.avatarUrl} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-3xl font-extrabold text-ink">
              {name}
            </h1>
            {profile.isAdmin && (
              <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-bold uppercase text-accent">
                Admin
              </span>
            )}
            <FriendshipAction profile={profile} onRequestAuth={onRequestAuth} />
            <button
              type="button"
              onClick={() => setReportOpen((current) => !current)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-control px-2.5 text-xs font-bold text-ink transition-colors hover:bg-control-hover"
            >
              <Flag className="size-3.5 text-accent-icon" />
              Report
            </button>
            <CopyLinkButton />
          </div>
          <ProfileMessageForm profile={profile} onRequestAuth={onRequestAuth} />
          <p className="mt-1 text-sm font-semibold text-muted">
            @{profile.username} · joined {timeAgo(profile.createdAt)}
          </p>
          {profile.bio && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink">
              {profile.bio}
            </p>
          )}
          {reportOpen && (
            <ProfileReportForm
              profile={profile}
              onRequestAuth={onRequestAuth}
              onMessage={setMessage}
              onSubmitted={() => setReportOpen(false)}
            />
          )}
          {message && (
            <p className="mt-2 text-xs font-semibold text-muted">{message}</p>
          )}
        </div>
      </div>

      <ProfileStats profile={profile} />
    </header>
  );
}
