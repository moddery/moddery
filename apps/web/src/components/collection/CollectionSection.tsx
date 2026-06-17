import { type PublicCollection } from '../../lib/catalog.ts';
import { timeAgo } from '../../lib/format.ts';
import type { Mod } from '../../types.ts';
import type { SearchTag } from '../ModCard.tsx';
import { CollectionProjectItem } from './CollectionProjectItem.tsx';

export function CollectionSection({
  collection,
  onOpenCollection,
  onOpenProject,
  onTagSearch,
}: {
  collection: PublicCollection;
  onOpenCollection?: (collection: PublicCollection) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  const ownerName = collection.owner.displayName ?? collection.owner.username;

  return (
    <section className="border-b border-line pb-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3 rounded-full"
              style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
            />
            <a
              href={collectionHref(collection)}
              onClick={(event) => {
                if (!onOpenCollection) return;
                event.preventDefault();
                onOpenCollection(collection);
              }}
              className="min-w-0 text-ink transition-colors hover:text-accent"
            >
              <h2 className="truncate font-display text-xl font-extrabold">
                {collection.name}
              </h2>
            </a>
          </div>
          {collection.description && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              {collection.description}
            </p>
          )}
        </div>
        <p className="text-sm font-semibold text-muted">
          {collection.projectCount.toLocaleString('en-US')} projects by{' '}
          <a
            href={`/users/${collection.owner.username}`}
            className="text-ink transition-colors hover:text-accent"
          >
            {ownerName}
          </a>{' '}
          · updated {timeAgo(collection.updatedAt)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {collection.items.map((item) => (
          <CollectionProjectItem
            key={item.project.slug}
            item={item}
            onOpenProject={onOpenProject}
            onTagSearch={onTagSearch}
          />
        ))}
      </div>
    </section>
  );
}

function collectionHref(collection: PublicCollection): string {
  return `/collections/${encodeURIComponent(
    collection.owner.username,
  )}/${encodeURIComponent(collection.slug)}`;
}
