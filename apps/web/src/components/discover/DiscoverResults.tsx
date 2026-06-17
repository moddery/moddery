import { cn } from '../../lib/cn.ts';
import { EmptyState } from '../EmptyState.tsx';
import { ModCard } from '../ModCard.tsx';
import { Pagination } from '../Pagination.tsx';
import { ResultsSkeleton } from '../Skeletons.tsx';
import { type DiscoverPageProps } from './types.ts';

type DiscoverResultsProps = Pick<
  DiscoverPageProps,
  | 'clearAll'
  | 'error'
  | 'layout'
  | 'loading'
  | 'meta'
  | 'mods'
  | 'onOpenProject'
  | 'onPage'
  | 'onTagSearch'
  | 'page'
  | 'total'
  | 'totalPages'
>;

export function DiscoverResults({
  clearAll,
  error,
  layout,
  loading,
  meta,
  mods,
  onOpenProject,
  onPage,
  onTagSearch,
  page,
  total,
  totalPages,
}: DiscoverResultsProps) {
  return (
    <>
      <div className="mt-5" aria-busy={loading}>
        {error && (
          <div className="mb-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-semibold text-ink">
            The catalog is not responding right now. {error}
          </div>
        )}

        {loading ? (
          <ResultsSkeleton layout={layout} count={5} />
        ) : total === 0 ? (
          <EmptyState onClear={clearAll} itemLabel={meta.plural} />
        ) : (
          <div
            className={cn(
              layout === 'grid'
                ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col',
            )}
          >
            {mods.map((mod) => (
              <div
                key={mod.slug}
                className={layout === 'grid' ? 'flex' : undefined}
              >
                <ModCard
                  mod={mod}
                  layout={layout}
                  onOpen={onOpenProject}
                  onTagSearch={onTagSearch}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && total > 0 && totalPages > 1 && (
        <div className="mt-6 flex justify-center sm:justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </>
  );
}
