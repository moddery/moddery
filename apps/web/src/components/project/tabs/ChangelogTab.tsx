import { type ProjectVersion } from '../../../lib/catalog.ts';
import { timeAgo } from '../../../lib/format.ts';
import { enumLabel } from '../../../lib/labels.ts';
import { EmptyTab } from './EmptyTab.tsx';
import { ProjectMarkdown } from './ProjectMarkdown.tsx';

export function ChangelogTab({ versions }: { versions: ProjectVersion[] }) {
  if (!versions.length) {
    return (
      <EmptyTab
        title="No changelog yet"
        body="This project does not have changelog notes yet."
      />
    );
  }

  return (
    <section aria-label="Changelog">
      {versions.map((version) => (
        <article key={version.id} className="border-b border-line py-5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2 className="font-display text-lg font-extrabold text-ink">
              {version.name}
            </h2>
            <span className="text-sm font-bold text-muted">
              {version.version_number}
            </span>
            <span className="text-xs font-bold uppercase text-accent-icon">
              {enumLabel(version.version_type)}
            </span>
            <span className="text-sm font-semibold text-muted">
              {timeAgo(version.date_published)}
            </span>
          </div>
          <ProjectMarkdown body={version.changelog ?? ''} />
        </article>
      ))}
    </section>
  );
}
