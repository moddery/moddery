import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { cn } from '../../../../lib/cn.ts';
import { enumLabel } from '../../../../lib/labels.ts';
import { Chip, LoaderTag } from '../../../Chips.tsx';
import { versionHref } from './helpers.ts';
import { DependencyChip } from './VersionDependencies.tsx';

export function VersionSummary({
  onSelectVersion,
  primaryFile,
  version,
}: {
  onSelectVersion: (versionNumber: string | null) => void;
  primaryFile: ProjectVersion['files'][number] | undefined;
  version: ProjectVersion;
}) {
  const authorName =
    version.author?.display_name ?? version.author?.username ?? null;
  const typeClass = {
    release: 'text-ink',
    beta: 'text-accent-icon',
    alpha: 'text-faint',
  }[version.version_type];

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <a
          href={versionHref(version.version_number)}
          onClick={(event) => {
            event.preventDefault();
            onSelectVersion(version.version_number);
          }}
          className="min-w-0 text-ink transition-colors hover:text-accent"
        >
          <h3 className="truncate font-display text-base font-extrabold">
            {version.name}
          </h3>
        </a>
        <span className="text-sm font-bold text-muted">
          {version.version_number}
        </span>
        <span className={cn('text-xs font-bold uppercase', typeClass)}>
          {enumLabel(version.version_type)}
        </span>
        {version.featured && <Chip>Featured</Chip>}
        {version.status !== 'APPROVED' && (
          <Chip>{enumLabel(version.status)}</Chip>
        )}
        {version.requested_status && (
          <Chip>Requested {enumLabel(version.requested_status)}</Chip>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {version.loaders.slice(0, 3).map((loader) => (
          <LoaderTag key={loader} loader={loader} />
        ))}
        {version.game_versions.slice(0, 4).map((gameVersion) => (
          <Chip key={gameVersion}>{gameVersion}</Chip>
        ))}
        {version.dependencies.slice(0, 3).map((dependency) => (
          <DependencyChip key={dependency.id} dependency={dependency} />
        ))}
      </div>
      {primaryFile && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-muted">
          <span>{primaryFile.filename}</span>
          <span>{version.files.length} file(s)</span>
          <span>Order {version.sort_order}</span>
          {version.author && authorName && (
            <a
              href={`/users/${version.author.username}`}
              className="transition-colors hover:text-accent"
            >
              by {authorName}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
