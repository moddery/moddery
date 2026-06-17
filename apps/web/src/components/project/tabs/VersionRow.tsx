import { ChevronDown, Download, Flag, Link, PackageCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { recordDownload, type ProjectVersion } from '../../../lib/catalog.ts';
import { cn } from '../../../lib/cn.ts';
import { formatCount, timeAgo } from '../../../lib/format.ts';
import { Chip, LoaderTag } from '../../Chips.tsx';
import {
  dependencyLabel,
  dependencyProjectHref,
} from './version-row/helpers.ts';
import { VersionFiles } from './version-row/VersionFiles.tsx';
import { VersionReportForm } from './version-row/VersionReportForm.tsx';

export function VersionRow({
  selected,
  version,
  onSelectVersion,
}: {
  selected: boolean;
  version: ProjectVersion;
  onSelectVersion: (versionNumber: string | null) => void;
}) {
  const primaryFile =
    version.files.find((file) => file.primary) ?? version.files[0];
  const [reportOpen, setReportOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(selected);
  const hasDetails =
    version.files.length > 0 || version.dependencies.length > 0;
  const authorName =
    version.author?.display_name ?? version.author?.username ?? null;
  const typeClass = {
    release: 'text-ink',
    beta: 'text-accent-icon',
    alpha: 'text-faint',
  }[version.version_type];

  async function downloadFile(file: ProjectVersion['files'][number]) {
    await recordDownload(file.id);
    window.location.assign(file.url);
  }

  useEffect(() => {
    setDetailsOpen(selected);
  }, [selected]);

  function toggleDetails() {
    const nextOpen = !detailsOpen;
    setDetailsOpen(nextOpen);
    onSelectVersion(nextOpen ? version.version_number : null);
  }

  return (
    <div
      className={cn(
        'grid gap-3 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center',
        selected && 'bg-accent-soft/40',
      )}
    >
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
            {version.version_type}
          </span>
          {version.featured && <Chip>Featured</Chip>}
          {version.status !== 'APPROVED' && <Chip>{version.status}</Chip>}
          {version.requested_status && (
            <Chip>Requested {version.requested_status}</Chip>
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

      <div className="flex items-center gap-4 text-sm sm:justify-end">
        <span className="hidden font-semibold text-muted sm:inline">
          {timeAgo(version.date_published)}
        </span>
        <span className="hidden font-semibold text-muted lg:inline">
          Updated {timeAgo(version.updated_at)}
        </span>
        <span className="inline-flex items-center gap-1.5 font-bold text-ink tabular-nums">
          <Download className="size-4 text-accent-icon" />
          {formatCount(version.downloads, 1)}
        </span>
        <button
          type="button"
          onClick={() => setReportOpen((current) => !current)}
          className="grid size-9 place-items-center rounded-lg bg-control text-accent-icon transition-colors hover:bg-control-hover"
          aria-label={`Report ${version.name}`}
        >
          <Flag className="size-4" />
        </button>
        <a
          href={versionHref(version.version_number)}
          onClick={(event) => {
            event.preventDefault();
            onSelectVersion(version.version_number);
          }}
          className="grid size-9 place-items-center rounded-lg bg-control text-accent-icon transition-colors hover:bg-control-hover"
          aria-label={`Link to ${version.name}`}
        >
          <Link className="size-4" />
        </a>
        {hasDetails && (
          <button
            type="button"
            onClick={toggleDetails}
            className="grid size-9 place-items-center rounded-lg bg-control text-accent-icon transition-colors hover:bg-control-hover"
            aria-label={`Show details for ${version.name}`}
            aria-expanded={detailsOpen}
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                detailsOpen && 'rotate-180',
              )}
            />
          </button>
        )}
        {primaryFile && (
          <button
            type="button"
            onClick={() => void downloadFile(primaryFile)}
            className="grid size-9 place-items-center rounded-lg bg-control text-accent-icon transition-colors hover:bg-control-hover"
            aria-label={`Download ${version.name}`}
          >
            <Download className="size-4" />
          </button>
        )}
      </div>

      {reportOpen && (
        <div className="sm:col-span-2">
          <VersionReportForm
            version={version}
            onSubmitted={() => setReportOpen(false)}
          />
        </div>
      )}

      {detailsOpen && (
        <div className="grid gap-3 sm:col-span-2">
          <VersionDependencies dependencies={version.dependencies} />
          <VersionFiles files={version.files} onDownload={downloadFile} />
        </div>
      )}
    </div>
  );
}

function versionHref(versionNumber: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', 'versions');
  url.searchParams.set('version', versionNumber);

  return `${url.pathname}${url.search}${url.hash}`;
}

function VersionDependencies({
  dependencies,
}: {
  dependencies: ProjectVersion['dependencies'];
}) {
  if (dependencies.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-muted">
        <PackageCheck className="size-4 text-accent-icon" />
        Dependencies
      </div>
      <div className="grid gap-2">
        {dependencies.map((dependency) => (
          <DependencyRow key={dependency.id} dependency={dependency} />
        ))}
      </div>
    </div>
  );
}

function DependencyRow({
  dependency,
}: {
  dependency: ProjectVersion['dependencies'][number];
}) {
  const href = dependencyProjectHref(dependency);
  const target =
    dependency.targetProject?.title ??
    dependency.targetVersion?.versionNumber ??
    dependency.externalFileName ??
    'External file';

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-bold uppercase text-muted">
        {dependency.dependencyKind.toLowerCase()}
      </span>
      {href === null ? (
        <span className="font-semibold text-ink">{target}</span>
      ) : (
        <a
          href={href}
          className="font-semibold text-ink transition-colors hover:text-accent"
        >
          {target}
        </a>
      )}
      {dependency.targetProject !== null && dependency.targetVersion && (
        <span className="text-xs font-semibold text-muted">
          Version {dependency.targetVersion.versionNumber}
        </span>
      )}
    </div>
  );
}

function DependencyChip({
  dependency,
}: {
  dependency: ProjectVersion['dependencies'][number];
}) {
  const href = dependencyProjectHref(dependency);
  const label = dependencyLabel(dependency);

  if (href === null) {
    return <Chip>{label}</Chip>;
  }

  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-control-hover hover:text-accent"
    >
      {label}
    </a>
  );
}
