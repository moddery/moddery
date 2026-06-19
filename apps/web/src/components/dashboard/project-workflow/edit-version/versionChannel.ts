import { type VersionChannel } from '@moddery/shared';

import { type ProjectVersion } from '../../../../lib/catalog.ts';

export { type VersionChannel };

export function versionChannelFromProjectVersion(
  version: Pick<ProjectVersion, 'versionType'> | null,
): VersionChannel {
  if (version?.versionType === 'alpha') return 'ALPHA';
  if (version?.versionType === 'beta') return 'BETA';
  return 'RELEASE';
}

export function versionSortOrderFieldValue(
  version: Pick<ProjectVersion, 'sortOrder'> | null,
): string {
  return String(version?.sortOrder ?? 0);
}

export function versionSortOrderFromField(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
