import { timeAgo } from '../../lib/format.ts';
import { type PublicUserListItem } from '../../lib/users.ts';

type UserDirectoryMeta = Pick<
  PublicUserListItem,
  | 'collectionCount'
  | 'createdAt'
  | 'friendCount'
  | 'organizationCount'
  | 'projectCount'
  | 'username'
>;

export function userDirectoryMeta(user: UserDirectoryMeta, now?: Date): string {
  return [
    `@${user.username}`,
    `joined ${timeAgo(user.createdAt, now)}`,
    `${formatCount(user.projectCount)} projects`,
    `${formatCount(user.collectionCount)} collections`,
    `${formatCount(user.organizationCount)} organizations`,
    `${formatCount(user.friendCount)} friends`,
  ].join(' · ');
}

function formatCount(count: number): string {
  return count.toLocaleString('en-US');
}
