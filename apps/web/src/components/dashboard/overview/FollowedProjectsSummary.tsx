import { useQuery } from '@tanstack/react-query';

import {
  fetchViewerFollowedProjects,
  setProjectFollowing,
} from '../../../lib/catalog.ts';
import { type DashboardData } from '../../../lib/dashboard.ts';
import { type Mod } from '../../../types.ts';
import { ModCard } from '../../ModCard.tsx';

export function FollowedProjectsSummary({
  dashboard,
  onOpenProject,
}: {
  dashboard: DashboardData;
  onOpenProject: (mod: Mod) => void;
}) {
  const followedQuery = useQuery({
    queryFn: ({ signal }) => fetchViewerFollowedProjects(signal),
    queryKey: ['dashboard', 'followed-projects'],
  });
  const followedProjects = followedQuery.data ?? [];
  const followedCount = followedQuery.data
    ? followedProjects.length
    : dashboard.followedProjectCount;

  async function unfollow(project: Mod) {
    await setProjectFollowing(project.slug, false);
    await followedQuery.refetch();
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
          {followedProjects.map((project) => (
            <div key={project.slug} className="relative">
              <ModCard mod={project} layout="list" onOpen={onOpenProject} />
              <button
                type="button"
                onClick={() => void unfollow(project)}
                className="absolute bottom-3 right-3 inline-flex h-8 items-center rounded-lg bg-control px-3 text-xs font-bold text-muted transition-colors hover:bg-control-hover hover:text-ink"
              >
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
