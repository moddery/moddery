import { Lock, Unlock, Users, type LucideIcon } from 'lucide-react';

export interface CollectionVisibilityMeta {
  Icon: LucideIcon;
  label: string;
}

export function collectionVisibilityMeta(
  visibility: string,
): CollectionVisibilityMeta {
  switch (visibility) {
    case 'PRIVATE':
      return { Icon: Lock, label: 'Private' };
    case 'UNLISTED':
      return { Icon: Unlock, label: 'Unlisted' };
    default:
      return { Icon: Users, label: 'Public' };
  }
}
