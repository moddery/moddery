import { UserRound } from 'lucide-react';

export function ProfileAvatar({ avatarUrl }: { avatarUrl: string | null }) {
  return (
    <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 text-muted">
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        <UserRound className="size-8" />
      )}
    </div>
  );
}
