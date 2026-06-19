import { type VersionChannel } from '@moddery/shared';

import { type DashboardVersion } from '../../../../lib/dashboard.ts';

export { type VersionChannel };

export const versionStatusOptions = [
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'ARCHIVED',
] as const;

export function versionChannelFromDashboardVersion(
  version: Pick<DashboardVersion, 'channel'> | null,
): VersionChannel {
  return version?.channel ?? 'RELEASE';
}

export function versionSortOrderFieldValue(
  version: Pick<DashboardVersion, 'sortOrder'> | null,
): string {
  return String(version?.sortOrder ?? 0);
}

export function versionSortOrderFromField(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
