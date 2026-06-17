import { Download, Flag } from 'lucide-react';
import { useState } from 'react';

import { recordDownload, type ProjectVersion } from '../../../lib/catalog.ts';
import { cn } from '../../../lib/cn.ts';
import { formatCount, timeAgo } from '../../../lib/format.ts';
import { Chip, LoaderTag } from '../../Chips.tsx';
import { dependencyLabel, shortHash } from './version-row/helpers.ts';
import { VersionReportForm } from './version-row/VersionReportForm.tsx';

export function VersionRow({ version }: { version: ProjectVersion }) {
  const primaryFile =
    version.files.find((file) => file.primary) ?? version.files[0];
  const [reportOpen, setReportOpen] = useState(false);
  const typeClass = {
    release: 'text-ink',
    beta: 'text-accent-icon',
    alpha: 'text-faint',
  }[version.version_type];

  async function downloadFile(file: ProjectVersion['files'][number]) {
    await recordDownload(file.id);
    window.location.assign(file.url);
  }

  return (
    <div className="grid gap-3 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate font-display text-base font-extrabold text-ink">
            {version.name}
          </h3>
          <span className="text-sm font-bold text-muted">
            {version.version_number}
          </span>
          <span className={cn('text-xs font-bold uppercase', typeClass)}>
            {version.version_type}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {version.loaders.slice(0, 3).map((loader) => (
            <LoaderTag key={loader} loader={loader} />
          ))}
          {version.game_versions.slice(0, 4).map((gameVersion) => (
            <Chip key={gameVersion}>{gameVersion}</Chip>
          ))}
          {version.dependencies.slice(0, 3).map((dependency) => (
            <Chip key={dependency.id}>{dependencyLabel(dependency)}</Chip>
          ))}
        </div>
        {primaryFile && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-muted">
            <span>{primaryFile.filename}</span>
            {primaryFile.scans[0] && (
              <span>
                Scan{' '}
                {primaryFile.scans[0].verdict ?? primaryFile.scans[0].status}
              </span>
            )}
            {primaryFile.hashes.slice(0, 2).map((hash) => (
              <span key={hash.algorithm}>
                {hash.algorithm} {shortHash(hash.value)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm sm:justify-end">
        <span className="hidden font-semibold text-muted sm:inline">
          {timeAgo(version.date_published)}
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
    </div>
  );
}
