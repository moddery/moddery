import { type VersionChannel } from '@moddery/shared';

import { type ProjectVersion } from '../../../../lib/catalog.ts';

export { type VersionChannel };

export function versionChannelFromProjectVersion(
  version: ProjectVersion | null,
): VersionChannel {
  if (version?.version_type === 'alpha') return 'ALPHA';
  if (version?.version_type === 'beta') return 'BETA';
  return 'RELEASE';
}
