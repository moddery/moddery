import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { BookMarked, Download, Heart, Package, UserRound } from 'lucide-react';

import { timeAgo } from '../lib/format.ts';
import {
  fetchUserProfile,
  userProjectToMod,
  type PublicUserProfile,
  type UserCollectionPreview,
} from '../lib/users.ts';
import type { Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { ModCard } from './ModCard.tsx';

export function UserProfilePage({
  username,
  onOpenProject,
}: {
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

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <ProfileHeader profile={profileQuery.data} />

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Projects
          </h2>
          <span className="text-sm font-semibold text-muted">
            {profileQuery.data.projectCount.toLocaleString('en-US')} total
          </span>
        </div>

        {profileQuery.data.projects.length === 0 ? (
          <p className="py-8 text-sm text-muted">No public projects yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {profileQuery.data.projects.map((project) => {
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
            {profileQuery.data.collectionCount.toLocaleString('en-US')} total
          </span>
        </div>

        {profileQuery.data.collections.length === 0 ? (
          <p className="py-8 text-sm text-muted">No public collections yet.</p>
        ) : (
          <div className="mt-4 grid gap-5">
            {profileQuery.data.collections.map((collection) => (
              <CollectionPreview
                key={collection.id}
                collection={collection}
                onOpenProject={onOpenProject}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ProfileHeader({ profile }: { profile: PublicUserProfile }) {
  const name = profile.displayName ?? profile.username;

  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 text-muted">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-8" />
          )}
        </div>

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
          </div>
          <p className="mt-1 text-sm font-semibold text-muted">
            @{profile.username} · joined {timeAgo(profile.createdAt)}
          </p>
          {profile.bio && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

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
          icon={<Download className="size-4" />}
          label="Downloads"
          value={profile.projects.reduce(
            (total, project) => total + project.downloads,
            0,
          )}
        />
      </div>
    </header>
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

function CollectionPreview({
  collection,
  onOpenProject,
}: {
  collection: UserCollectionPreview;
  onOpenProject: (mod: Mod) => void;
}) {
  return (
    <section className="border-b border-line pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
        />
        <h3 className="font-display text-lg font-extrabold text-ink">
          {collection.name}
        </h3>
        <span className="text-sm font-semibold text-muted">
          {collection.projectCount.toLocaleString('en-US')} projects · updated{' '}
          {timeAgo(collection.updatedAt)}
        </span>
      </div>
      {collection.description && (
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          {collection.description}
        </p>
      )}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {collection.projects.map((project) => {
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
    </section>
  );
}

function UserProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <div className="border-b border-line pb-6">
        <div className="flex gap-5">
          <div className="size-20 animate-pulse rounded-xl bg-surface-2" />
          <div className="flex-1">
            <div className="h-8 w-56 animate-pulse rounded bg-surface-2" />
            <div className="mt-3 h-4 w-40 animate-pulse rounded bg-surface-2" />
            <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded bg-surface-2" />
        <div className="h-28 animate-pulse rounded bg-surface-2" />
      </div>
    </main>
  );
}
