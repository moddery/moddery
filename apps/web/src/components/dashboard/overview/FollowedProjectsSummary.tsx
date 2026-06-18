import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchViewerFollowedProjects,
  setProjectFollowing,
} from '../../../lib/catalog.ts';
import { type DashboardData } from '../../../lib/dashboard.ts';
import { type Mod } from '../../../types.ts';
import { ModCard, type SearchTag } from '../../ModCard.tsx';
import { Pagination } from '../../Pagination.tsx';

const pageSize = 20;

export function FollowedProjectsSummary({
  dashboard,
  onOpenProject,
  onTagSearch,
  onUpdated,
}: {
  dashboard: DashboardData;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
  onUpdated: () => Promise<void>;
}) {
  const [page, setPage] = useState(1);
  const [unfollowingSlug, setUnfollowingSlug] = useState<string | null>(null);
  const followedQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerFollowedProjects(page, pageSize, signal),
    queryKey: ['dashboard', 'followed-projects', page],
  });
  const followedProjects = followedQuery.data?.projects ?? [];
  const followedCount = followedQuery.data
    ? followedQuery.data.totalHits
    : dashboard.followedProjectCount;
  const totalPages = Math.max(1, Math.ceil(followedCount / pageSize));

  async function unfollow(project: Mod) {
    setUnfollowingSlug(project.slug);

    try {
      await setProjectFollowing(project.slug, false);
      await followedQuery.refetch();
      await onUpdated();
      if (followedProjects.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } finally {
      setUnfollowingSlug(null);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Followed projects
        </h2>
        <span className="text-sm font-semibold text-muted">
          {followedCount.toLocaleString('en-US')} total
        </span>
      </div>

      {followedQuery.isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded bg-surface-2"
            />
          ))}
        </div>
      ) : followedQuery.error ? (
        <p className="py-8 text-sm text-muted">
          Followed projects could not be loaded.
        </p>
      ) : followedProjects.length === 0 ? (
        <p className="py-8 text-sm text-muted">
          Projects you follow will show up here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {totalPages > 1 && (
            <div className="lg:col-span-2 flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
          {followedProjects.map((project) => (
            <div key={project.slug} className="relative">
              <ModCard
                mod={project}
                layout="list"
                onOpen={onOpenProject}
                onTagSearch={onTagSearch}
              />
              <button
                type="button"
                disabled={unfollowingSlug === project.slug}
                onClick={() => void unfollow(project)}
                className="absolute bottom-3 right-3 inline-flex h-8 items-center rounded-lg bg-control px-3 text-xs font-bold text-muted transition-colors hover:bg-control-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {unfollowingSlug === project.slug ? 'Unfollowing' : 'Unfollow'}
              </button>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="lg:col-span-2 flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
