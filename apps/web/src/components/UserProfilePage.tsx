import { useQuery } from '@tanstack/react-query';

import { fetchUserProfile, userProjectToMod } from '../lib/users.ts';
import type { Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { ModCard } from './ModCard.tsx';
import { CollectionPreview } from './user-profile/CollectionPreview.tsx';
import { ProfileHeader } from './user-profile/ProfileHeader.tsx';
import { UserModerationNotes } from './user-profile/UserModerationNotes.tsx';
import { UserProfileSkeleton } from './user-profile/UserProfileSkeleton.tsx';

export function UserProfilePage({
  onOpenCollection,
  username,
  onOpenProject,
}: {
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  username: string;
  onOpenProject: (mod: Mod) => void;
}) {
  const profileQuery = useQuery({
    queryFn: ({ signal }) => fetchUserProfile(username, signal),
    queryKey: ['users', username],
  });

  if (profileQuery.isLoading) {
    return <UserProfileSkeleton />;
  }

  if (!profileQuery.data) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState onClear={() => window.history.back()} itemLabel="users" />
      </main>
    );
  }

  const profile = profileQuery.data;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <ProfileHeader profile={profile} />
      <UserModerationNotes username={profile.username} />

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Projects
          </h2>
          <span className="text-sm font-semibold text-muted">
            {profile.projectCount.toLocaleString('en-US')} total
          </span>
        </div>

        {profile.projects.length === 0 ? (
          <p className="py-8 text-sm text-muted">No public projects yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {profile.projects.map((project) => {
              const mod = userProjectToMod(project);
              return (
                <ModCard
                  key={project.slug}
                  mod={mod}
                  layout="list"
                  onOpen={onOpenProject}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Collections
          </h2>
          <span className="text-sm font-semibold text-muted">
            {profile.collectionCount.toLocaleString('en-US')} total
          </span>
        </div>

        {profile.collections.length === 0 ? (
          <p className="py-8 text-sm text-muted">No public collections yet.</p>
        ) : (
          <div className="mt-4 grid gap-5">
            {profile.collections.map((collection) => (
              <CollectionPreview
                key={collection.id}
                collection={collection}
                ownerUsername={profile.username}
                onOpenCollection={onOpenCollection}
                onOpenProject={onOpenProject}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
