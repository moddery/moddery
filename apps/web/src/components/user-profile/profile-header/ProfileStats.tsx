import { type ReactNode } from 'react';
import { BookMarked, Building2, Heart, Package, Users } from 'lucide-react';

import { type PublicUserProfile } from '../../../lib/users.ts';
import { profileStatCounts } from './profile-stats.ts';

export function ProfileStats({ profile }: { profile: PublicUserProfile }) {
  const stats = profileStatCounts(profile);

  return (
    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <ProfileStat
        icon={<Package className="size-4" />}
        label="Projects"
        value={stats.projects}
      />
      <ProfileStat
        icon={<BookMarked className="size-4" />}
        label="Collections"
        value={stats.collections}
      />
      <ProfileStat
        icon={<Building2 className="size-4" />}
        label="Organizations"
        value={stats.organizations}
      />
      <ProfileStat
        icon={<Heart className="size-4" />}
        label="Following"
        value={stats.following}
      />
      <ProfileStat
        icon={<Users className="size-4" />}
        label="Friends"
        value={stats.friends}
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
