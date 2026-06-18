import { Lock, Unlock, Users } from 'lucide-react';

import { type PublicCollection } from '../../../lib/catalog.ts';
import { formatDate, timeAgo } from '../../../lib/format.ts';
import { CopyLinkButton } from '../../CopyLinkButton.tsx';

export function CollectionDetailHeader({
  collection,
}: {
  collection: PublicCollection;
}) {
  const ownerName = collection.owner.displayName ?? collection.owner.username;
  const visibility = collectionVisibilityMeta(collection.visibility);

  return (
    <header className="mt-5 border-b border-line pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {collection.iconUrl ? (
          <img
            src={collection.iconUrl}
            alt={`${collection.name} icon`}
            width={96}
            height={96}
            className="size-20 rounded-md bg-surface-2 object-cover sm:size-24"
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid size-20 place-items-center rounded-md bg-surface-2 sm:size-24"
          >
            <span
              className="size-8 rounded-full"
              style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">
              {collection.name}
            </h1>
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-control px-2.5 text-xs font-bold text-muted">
              <visibility.Icon className="size-3.5 text-accent-icon" />
              {visibility.label}
            </span>
          </div>

          {collection.description && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              {collection.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-muted">
            <span>
              {collection.projectCount.toLocaleString('en-US')} projects
            </span>
            <span aria-hidden="true">·</span>
            <span>
              by{' '}
              <a
                href={`/users/${collection.owner.username}`}
                className="text-ink transition-colors hover:text-accent"
              >
                {ownerName}
              </a>
            </span>
            <span aria-hidden="true">·</span>
            <span>created {formatDate(collection.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span>updated {timeAgo(collection.updatedAt)}</span>
          </div>
        </div>

        <CopyLinkButton />
      </div>
    </header>
  );
}

function collectionVisibilityMeta(visibility: string) {
  switch (visibility) {
    case 'PRIVATE':
      return { Icon: Lock, label: 'Private' };
    case 'UNLISTED':
      return { Icon: Unlock, label: 'Unlisted' };
    default:
      return { Icon: Users, label: 'Public' };
  }
}
