import { type PublicCollectionItem } from '../../lib/catalog.ts';
import { timeAgo } from '../../lib/format.ts';
import type { Mod } from '../../types.ts';
import { ModCard, type SearchTag } from '../ModCard.tsx';

export function CollectionProjectItem({
  item,
  onOpenProject,
  onTagSearch,
}: {
  item: PublicCollectionItem;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  const addedBy =
    item.addedBy?.displayName ?? item.addedBy?.username ?? 'Unknown user';

  return (
    <div className="min-w-0">
      <ModCard
        layout="list"
        mod={item.project}
        onOpen={onOpenProject}
        onTagSearch={onTagSearch}
      />
      <p className="mt-1 px-1 text-xs font-semibold text-muted">
        Added by {addedBy} · {timeAgo(item.createdAt)}
      </p>
    </div>
  );
}
