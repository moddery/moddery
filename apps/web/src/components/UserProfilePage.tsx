import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  fetchPublicUserCollections,
  fetchPublicUserProjects,
  fetchUserProfile,
  userProjectToMod,
} from '../lib/users.ts';
import type { Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { ModCard } from './ModCard.tsx';
import { Pagination } from './Pagination.tsx';
import { CollectionPreview } from './user-profile/CollectionPreview.tsx';
import { ProfileHeader } from './user-profile/ProfileHeader.tsx';
import { UserModerationNotes } from './user-profile/UserModerationNotes.tsx';
import { UserProfileSkeleton } from './user-profile/UserProfileSkeleton.tsx';

const projectPageSize = 12;
const collectionPageSize = 10;

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
  const [projectPage, setProjectPage] = useState(1);
  const [collectionPage, setCollectionPage] = useState(1);

  useEffect(() => {
    setProjectPage(1);
    setCollectionPage(1);
  }, [username]);

  const profileQuery = useQuery({
    queryFn: ({ signal }) => fetchUserProfile(username, signal),
    queryKey: ['users', username],
  });
  const projectsQuery = useQuery({
    enabled: Boolean(profileQuery.data),
    queryFn: ({ signal }) =>
      fetchPublicUserProjects(username, projectPage, projectPageSize, signal),
    queryKey: ['users', username, 'projects', projectPage],
  });
  const collectionsQuery = useQuery({
    enabled: Boolean(profileQuery.data),
    queryFn: ({ signal }) =>
      fetchPublicUserCollections(
        username,
        collectionPage,
        collectionPageSize,
        signal,
      ),
    queryKey: ['users', username, 'collections', collectionPage],
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
  const projects = projectsQuery.data?.projects ?? profile.projects;
  const collections = collectionsQuery.data?.collections ?? profile.collections;
  const projectTotal = projectsQuery.data?.totalHits ?? profile.projectCount;
  const collectionTotal =
    collectionsQuery.data?.totalHits ?? profile.collectionCount;
  const projectTotalPages = Math.max(
    1,
    Math.ceil(projectTotal / projectPageSize),
  );
  const collectionTotalPages = Math.max(
    1,
    Math.ceil(collectionTotal / collectionPageSize),
  );

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
            {projectTotal.toLocaleString('en-US')} total
          </span>
        </div>

        {projectsQuery.isLoading ? (
          <ProjectGridSkeleton />
        ) : projects.length === 0 ? (
          <p className="py-8 text-sm text-muted">No public projects yet.</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {projects.map((project) => {
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
            {projectTotalPages > 1 && (
              <div className="mt-5 flex justify-end">
                <Pagination
                  page={projectPage}
                  totalPages={projectTotalPages}
                  onPage={setProjectPage}
                />
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Collections
          </h2>
          <span className="text-sm font-semibold text-muted">
            {collectionTotal.toLocaleString('en-US')} total
          </span>
        </div>

        {collectionsQuery.isLoading ? (
          <CollectionListSkeleton />
        ) : collections.length === 0 ? (
          <p className="py-8 text-sm text-muted">No public collections yet.</p>
        ) : (
          <>
            <div className="mt-4 grid gap-5">
              {collections.map((collection) => (
                <CollectionPreview
                  key={collection.id}
                  collection={collection}
                  ownerUsername={profile.username}
                  onOpenCollection={onOpenCollection}
                  onOpenProject={onOpenProject}
                />
              ))}
            </div>
            {collectionTotalPages > 1 && (
              <div className="mt-5 flex justify-end">
                <Pagination
                  page={collectionPage}
                  totalPages={collectionTotalPages}
                  onPage={setCollectionPage}
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function ProjectGridSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded bg-surface-2" />
      ))}
    </div>
  );
}

function CollectionListSkeleton() {
  return (
    <div className="mt-4 grid gap-5">
      {[0, 1].map((item) => (
        <section key={item} className="border-b border-line pb-5">
          <div className="h-6 w-56 animate-pulse rounded bg-surface-2" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="h-24 animate-pulse rounded bg-surface-2" />
            <div className="h-24 animate-pulse rounded bg-surface-2" />
          </div>
        </section>
      ))}
    </div>
  );
}
