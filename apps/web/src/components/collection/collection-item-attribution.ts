import { timeAgo } from '../../lib/format.ts';

export function collectionItemPosition(sortOrder: number): string {
  return `Position ${(sortOrder + 1).toLocaleString('en-US')}`;
}

export function collectionItemAddedLabel(createdAt: string, now?: Date) {
  return `Added ${timeAgo(createdAt, now)}`;
}
