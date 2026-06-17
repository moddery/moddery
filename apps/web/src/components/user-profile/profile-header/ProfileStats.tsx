import { type ReactNode } from 'react';
import { BookMarked, Heart, Package, Users } from 'lucide-react';

import { type PublicUserProfile } from '../../../lib/users.ts';

export function ProfileStats({ profile }: { profile: PublicUserProfile }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <ProfileStat
        icon={<Package className="size-4" />}
        label="Projects"
        value={profile.projectCount}
      />
      <ProfileStat
        icon={<BookMarked className="size-4" />}
        label="Collections"
        value={profile.collectionCount}
      />
      <ProfileStat
        icon={<Heart className="size-4" />}
        label="Following"
        value={profile.followedProjectCount}
      />
      <ProfileStat
        icon={<Users className="size-4" />}
        label="Friends"
        value={profile.friendCount}
      />
    </div>
  );
}

function ProfileStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <div className="mt-1 text-lg font-extrabold text-ink tabular-nums">
        {value.toLocaleString('en-US')}
      </div>
    </div>
  );
}
