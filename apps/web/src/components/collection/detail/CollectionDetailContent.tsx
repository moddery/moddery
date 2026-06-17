import {
  type PublicCollection,
  type PublicCollectionItem,
} from '../../../lib/catalog.ts';
import type { Mod } from '../../../types.ts';
import type { SearchTag } from '../../ModCard.tsx';
import { CollectionDetailHeader } from './CollectionDetailHeader.tsx';
import { CollectionDetailItems } from './CollectionDetailItems.tsx';

export function CollectionDetailContent({
  collection,
  isLoadingItems,
  itemPage,
  itemTotalPages,
  items,
  onItemPage,
  onOpenProject,
  onTagSearch,
}: {
  collection: PublicCollection;
  isLoadingItems: boolean;
  itemPage: number;
  itemTotalPages: number;
  items: PublicCollectionItem[];
  onItemPage: (page: number) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  return (
    <>
      <CollectionDetailHeader collection={collection} />
      <CollectionDetailItems
        isLoading={isLoadingItems}
        items={items}
        onItemPage={onItemPage}
        onOpenProject={onOpenProject}
        onTagSearch={onTagSearch}
        page={itemPage}
        totalPages={itemTotalPages}
      />
    </>
  );
}
