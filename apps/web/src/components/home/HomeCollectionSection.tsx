import { collectionPath } from '../../app/routing.ts';
import { type PublicCollection } from '../../lib/catalog.ts';
import { timeAgo } from '../../lib/format.ts';
import { type Mod } from '../../types.ts';
import { ModCard, type SearchTag } from '../ModCard.tsx';
import { ProjectRowSkeleton } from './ProjectRowSkeleton.tsx';

export function HomeCollectionSection({
  collections,
  loading,
  onOpenCollection,
  onOpenProject,
  onTagSearch,
}: {
  collections: PublicCollection[];
  loading: boolean;
  onOpenCollection?: (collection: PublicCollection) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch: (tag: SearchTag) => void;
}) {
  return (
    <section>
      <div className="flex flex-col gap-1 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Community collections
        </h2>
        <p className="text-sm leading-6 text-muted">
          Curated lists for finding related projects quickly.
        </p>
      </div>

      {loading ? (
        <ProjectRowSkeleton />
      ) : collections.length === 0 ? (
        <p className="py-8 text-sm text-muted">No collections to show yet.</p>
      ) : (
        <div className="mt-4 grid gap-6">
          {collections.map((collection) => (
            <section key={collection.id} className="border-b border-line pb-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor: collection.color ?? '#1d9bf0',
                      }}
                    />
                    <a
                      href={collectionPath({
                        ownerUsername: collection.owner.username,
                        slug: collection.slug,
                      })}
                      onClick={(event) => {
                        if (!onOpenCollection) return;
                        event.preventDefault();
                        onOpenCollection(collection);
                      }}
                      className="min-w-0 text-ink transition-colors hover:text-accent"
                    >
                      <h3 className="truncate font-display text-lg font-extrabold">
                        {collection.name}
                      </h3>
                    </a>
                  </div>
                  {collection.description && (
                    <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-6 text-muted">
                      {collection.description}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold text-muted">
                  {collection.projectCount.toLocaleString('en-US')} projects ·{' '}
                  {timeAgo(collection.updatedAt)}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {collection.projects.slice(0, 2).map((project) => (
                  <ModCard
                    key={`${collection.id}-${project.slug}`}
                    layout="list"
                    mod={project}
                    onOpen={onOpenProject}
                    onTagSearch={onTagSearch}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
