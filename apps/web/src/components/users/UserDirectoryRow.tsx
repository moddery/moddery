import { userProjectToMod, type PublicUserListItem } from '../../lib/users.ts';
import { userPath } from '../../app/routing.ts';
import type { Mod } from '../../types.ts';
import { ModCard, type SearchTag } from '../ModCard.tsx';
import { ProfileAvatar } from '../user-profile/profile-header/ProfileAvatar.tsx';
import { userDirectoryMeta } from './user-directory-meta.ts';

export function UserDirectoryRow({
  onOpenProject,
  onTagSearch,
  user,
}: {
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
  user: PublicUserListItem;
}) {
  const name = user.displayName ?? user.username;

  return (
    <section className="border-b border-line pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <ProfileAvatar avatarUrl={user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={userPath(user.username)}
              className="truncate font-display text-xl font-extrabold text-ink transition-colors hover:text-accent"
            >
              {name}
            </a>
            {user.isAdmin && (
              <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-bold uppercase text-accent">
                Admin
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-muted">
            {userDirectoryMeta(user)}
          </p>
          {user.bio && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {user.projects.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {user.projects.slice(0, 2).map((project) => {
            const mod = userProjectToMod(project);
            return (
              <ModCard
                key={project.slug}
                mod={mod}
                layout="list"
                onOpen={onOpenProject}
                onTagSearch={onTagSearch}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
