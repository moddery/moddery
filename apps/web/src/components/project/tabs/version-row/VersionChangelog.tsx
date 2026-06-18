import { ScrollText } from 'lucide-react';

import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { ProjectMarkdown } from '../ProjectMarkdown.tsx';

export function VersionChangelog({
  changelog,
}: {
  changelog: ProjectVersion['changelog'];
}) {
  const body = changelog?.trim() ?? '';
  if (body.length === 0) return null;

  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-muted">
        <ScrollText className="size-4 text-accent-icon" />
        Changelog
      </div>
      <ProjectMarkdown body={body} />
    </div>
  );
}
