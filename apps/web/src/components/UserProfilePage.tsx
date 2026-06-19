import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  fetchPublicUserCollections,
  fetchPublicUserProjects,
  fetchUserProfile,
} from '../lib/users.ts';
import type { Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { type SearchTag } from './ModCard.tsx';
import { ProfileHeader } from './user-profile/ProfileHeader.tsx';
import { UserCollectionsSection } from './user-profile/UserCollectionsSection.tsx';
import { UserModerationNotes } from './user-profile/UserModerationNotes.tsx';
import { UserProjectsSection } from './user-profile/UserProjectsSection.tsx';
import { UserProfileSkeleton } from './user-profile/UserProfileSkeleton.tsx';

const projectPageSize = 12;
const collectionPageSize = 10;

export function UserProfilePage({
  onBack,
  onOpenCollection,
  username,
  onOpenProject,
  onRequestAuth,
  onTagSearch,
}: {
  onBack: () => void;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  username: string;
  onOpenProject: (mod: Mod) => void;
  onRequestAuth?: () => void;
  onTagSearch?: (tag: SearchTag) => void;
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
        <EmptyState
          actionLabel="Back to creators"
          onClear={onBack}
          itemLabel="users"
        />
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
      <ProfileHeader profile={profile} onRequestAuth={onRequestAuth} />
      <UserModerationNotes username={profile.username} />

      <UserProjectsSection
        loading={projectsQuery.isLoading}
        onOpenProject={onOpenProject}
        onTagSearch={onTagSearch}
        page={projectPage}
        projects={projects}
        setPage={setProjectPage}
        total={projectTotal}
        totalPages={projectTotalPages}
      />

      <UserCollectionsSection
        collections={collections}
        loading={collectionsQuery.isLoading}
        onOpenCollection={onOpenCollection}
        onOpenProject={onOpenProject}
        onTagSearch={onTagSearch}
        ownerUsername={profile.username}
        page={collectionPage}
        setPage={setCollectionPage}
        total={collectionTotal}
        totalPages={collectionTotalPages}
      />
    </main>
  );
}
