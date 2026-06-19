import { type ProjectModerationLock } from '../../../lib/catalog.ts';

export function projectModerationLockSummary(
  lock: ProjectModerationLock,
): string {
  const moderator = lock.moderator.displayName ?? lock.moderator.username;

  return `${moderator} until ${projectModerationLockExpiry(lock)}`;
}

export function projectModerationLockExpiry(
  lock: Pick<ProjectModerationLock, 'expiresAt'>,
): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  })
    .formatToParts(new Date(lock.expiresAt))
    .reduce<Record<string, string>>((accumulator, part) => {
      accumulator[part.type] = part.value;
      return accumulator;
    }, {});

  return `${parts.month ?? ''} ${parts.day ?? ''}, ${parts.hour ?? ''}:${
    parts.minute ?? ''
  } ${parts.dayPeriod ?? ''}`.trim();
}
