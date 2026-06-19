import { type ProjectKind } from '@moddery/shared';

import {
  CONTENT_TYPES,
  projectKindFromType,
  projectTypeMeta,
} from '../../lib/projectTypes.ts';

export function buildPlatformDiscoverHref({
  category,
  license,
  loader,
  projectKind,
  version,
}: {
  category?: string;
  license?: string;
  loader?: string;
  projectKind?: ProjectKind | null;
  version?: string;
}) {
  const projectType =
    CONTENT_TYPES.find(
      (item) =>
        projectKind !== null &&
        projectKind !== undefined &&
        projectKindFromType(item.type) === projectKind,
    ) ?? projectTypeMeta('mod');
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (license) params.set('license', license);
  if (loader) params.set('loader', loader);
  if (version) params.set('version', version);

  const query = params.toString();

  return `/${projectType.path}${query ? `?${query}` : ''}`;
}
