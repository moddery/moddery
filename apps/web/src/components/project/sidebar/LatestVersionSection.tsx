import { CalendarClock, GitBranch } from 'lucide-react';

import { type ProjectVersion } from '../../../lib/catalog.ts';
import { formatCount, timeAgo } from '../../../lib/format.ts';
import { enumLabel } from '../../../lib/labels.ts';
import { Chip, LoaderTag, VersionTag } from '../../Chips.tsx';
import { type SearchTag } from '../../ModCard.tsx';

export function LatestVersionSection({
  onTagSearch,
  onSelectVersion,
  version,
}: {
  onTagSearch?: (tag: SearchTag) => void;
  onSelectVersion: (versionNumber: string | null) => void;
  version: ProjectVersion | undefined;
}) {
  if (version === undefined) return null;

  return (
    <section className="mt-6 rounded-lg border border-line bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-extrabold text-ink">
            Latest version
          </h2>
          <p className="mt-1 truncate text-sm font-bold text-ink">
            {version.name}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">
            {version.versionNumber} · {enumLabel(version.versionType)}
          </p>
        </div>
        {version.featured && <Chip>Featured</Chip>}
      </div>

      <div className="mt-3 grid gap-2 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5 text-accent-icon" />
          Published {timeAgo(version.datePublished)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <GitBranch className="size-3.5 text-accent-icon" />
          {formatCount(version.downloads, 1)} downloads
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {version.loaders.slice(0, 3).map((loader) => (
          <LoaderTag
            key={loader}
            loader={loader}
            onClick={
              onTagSearch === undefined
                ? undefined
                : () => onTagSearch({ kind: 'loader', value: loader })
            }
          />
        ))}
        {version.gameVersions.slice(0, 4).map((gameVersion) => (
          <VersionTag
            key={gameVersion}
            version={gameVersion}
            onClick={
              onTagSearch === undefined
                ? undefined
                : () => onTagSearch({ kind: 'version', value: gameVersion })
            }
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onSelectVersion(version.versionNumber)}
        className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-control px-3 text-sm font-bold text-accent-icon transition-colors hover:bg-control-hover"
      >
        View version
      </button>
    </section>
  );
}
