import { ScrollText } from 'lucide-react';

import { type ProjectDetails } from '../../../lib/catalog.ts';
import { Chip } from '../../Chips.tsx';
import { type SearchTag } from '../../ModCard.tsx';
import { ExternalLink } from './ExternalLink.tsx';

export function ProjectLicenseSection({
  onTagSearch,
  project,
}: {
  onTagSearch?: (tag: SearchTag) => void;
  project: ProjectDetails;
}) {
  const searchTag = projectLicenseSearchTag(project);

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        License
      </h2>
      <div className="mt-3 rounded-lg border border-line bg-surface px-3 py-3">
        <div className="flex items-start gap-2">
          <ScrollText className="mt-0.5 size-4 shrink-0 text-accent-icon" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">
              {project.license.name}
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-muted">
              {project.license.id}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {searchTag !== null && (
            <Chip
              onClick={
                onTagSearch === undefined
                  ? undefined
                  : () => onTagSearch(searchTag)
              }
            >
              Filter by license
            </Chip>
          )}
        </div>

        {project.license.url && (
          <div className="mt-2">
            <ExternalLink href={project.license.url}>License text</ExternalLink>
          </div>
        )}
      </div>
    </section>
  );
}

export function projectLicenseSearchTag(
  project: Pick<ProjectDetails, 'license' | 'projectType'>,
): SearchTag | null {
  const value = project.license.id.trim().toLowerCase();

  if (value === '' || value === 'unknown') {
    return null;
  }

  return {
    kind: 'license',
    projectType: project.projectType,
    value,
  };
}
