import { type VersionChannel } from '@moddery/shared';

import { type DashboardVersion } from '../../../../lib/dashboard.ts';

export { type VersionChannel };

export function versionChannelFromDashboardVersion(
  version: Pick<DashboardVersion, 'channel'>,
): VersionChannel {
  return version.channel;
}

export function versionSortOrderFieldValue(
  version: Pick<DashboardVersion, 'sortOrder'>,
): string {
  return String(version.sortOrder);
}

export function versionSortOrderFromField(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error('Version order must be a number');
  }

  return parsed;
}
