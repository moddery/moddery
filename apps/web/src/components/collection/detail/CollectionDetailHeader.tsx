import { type PublicCollection } from '../../../lib/catalog.ts';
import { timeAgo } from '../../../lib/format.ts';

export function CollectionDetailHeader({
  collection,
}: {
  collection: PublicCollection;
}) {
  const ownerName = collection.owner.displayName ?? collection.owner.username;

  return (
    <header className="mt-5 border-b border-line pb-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="size-4 rounded-full"
          style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
        />
        <h1 className="font-display text-3xl font-extrabold text-ink">
          {collection.name}
        </h1>
      </div>
      {collection.description && (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          {collection.description}
        </p>
      )}
      <p className="mt-3 text-sm font-semibold text-muted">
        {collection.projectCount.toLocaleString('en-US')} projects by{' '}
        <a
          href={`/users/${collection.owner.username}`}
          className="text-ink transition-colors hover:text-accent"
        >
          {ownerName}
        </a>{' '}
        · updated {timeAgo(collection.updatedAt)}
      </p>
    </header>
  );
}
