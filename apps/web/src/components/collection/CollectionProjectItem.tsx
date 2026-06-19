import { UserRound } from 'lucide-react';

import { userPath } from '../../app/routing.ts';
import { type PublicCollectionItem } from '../../lib/catalog.ts';
import type { Mod } from '../../types.ts';
import { ModCard, type SearchTag } from '../ModCard.tsx';
import {
  collectionItemAddedLabel,
  collectionItemPosition,
} from './collection-item-attribution.ts';

export function CollectionProjectItem({
  item,
  onOpenProject,
  onTagSearch,
}: {
  item: PublicCollectionItem;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  return (
    <div className="min-w-0">
      <ModCard
        layout="list"
        mod={item.project}
        onOpen={onOpenProject}
        onTagSearch={onTagSearch}
      />
      <CollectionItemAttribution item={item} />
    </div>
  );
}

function CollectionItemAttribution({ item }: { item: PublicCollectionItem }) {
  if (item.addedBy === null) {
    return (
      <p className="mt-1 px-1 text-xs font-semibold text-muted">
        {collectionItemPosition(item.sortOrder)} ·{' '}
        {collectionItemAddedLabel(item.createdAt)}
      </p>
    );
  }

  const addedBy = item.addedBy.displayName ?? item.addedBy.username;

  return (
    <p className="mt-1 flex min-w-0 items-center gap-1.5 px-1 text-xs font-semibold text-muted">
      Added by{' '}
      <a
        href={userPath(item.addedBy.username)}
        className="inline-flex min-w-0 items-center gap-1 text-ink transition-colors hover:text-accent"
      >
        <span className="grid size-5 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface-2 text-faint">
          {item.addedBy.avatarUrl ? (
            <img
              src={item.addedBy.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-3" />
          )}
        </span>
        <span className="truncate">{addedBy}</span>
      </a>
      <span aria-hidden="true">·</span>
      <span>{collectionItemPosition(item.sortOrder)}</span>
      <span aria-hidden="true">·</span>
      <span>{collectionItemAddedLabel(item.createdAt)}</span>
    </p>
  );
}
