import { userProjectToMod, type UserProjectPreview } from '../../lib/users.ts';
import type { Mod } from '../../types.ts';
import { ModCard } from '../ModCard.tsx';
import { Pagination } from '../Pagination.tsx';

export function UserProjectsSection({
  loading,
  onOpenProject,
  page,
  projects,
  setPage,
  total,
  totalPages,
}: {
  loading: boolean;
  onOpenProject: (mod: Mod) => void;
  page: number;
  projects: UserProjectPreview[];
  setPage: (page: number) => void;
  total: number;
  totalPages: number;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Projects
        </h2>
        <span className="text-sm font-semibold text-muted">
          {total.toLocaleString('en-US')} total
        </span>
      </div>

      {loading ? (
        <UserProjectGridSkeleton />
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
          {totalPages > 1 && (
            <div className="mt-5 flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function UserProjectGridSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded bg-surface-2" />
      ))}
    </div>
  );
}
