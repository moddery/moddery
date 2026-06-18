import { type VersionChannel } from '@moddery/shared';

import { type ProjectVersion } from '../../../../lib/catalog.ts';

export { type VersionChannel };

export function versionChannelFromProjectVersion(
  version: ProjectVersion | null,
): VersionChannel {
  if (version?.versionType === 'alpha') return 'ALPHA';
  if (version?.versionType === 'beta') return 'BETA';
  return 'RELEASE';
}
