import { ChevronDown, Download, Flag, Link } from 'lucide-react';
import { type ReactNode } from 'react';

import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { cn } from '../../../../lib/cn.ts';
import { formatCount, timeAgo } from '../../../../lib/format.ts';
import { versionHref } from './helpers.ts';

export function VersionActions({
  detailsOpen,
  hasDetails,
  onDownload,
  onSelectVersion,
  onToggleDetails,
  onToggleReport,
  primaryFile,
  version,
}: {
  detailsOpen: boolean;
  hasDetails: boolean;
  onDownload: (file: ProjectVersion['files'][number]) => void;
  onSelectVersion: (versionNumber: string | null) => void;
  onToggleDetails: () => void;
  onToggleReport: () => void;
  primaryFile: ProjectVersion['files'][number] | undefined;
  version: ProjectVersion;
}) {
  return (
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
      <IconButton onClick={onToggleReport} label={`Report ${version.name}`}>
        <Flag className="size-4" />
      </IconButton>
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
        <IconButton
          onClick={onToggleDetails}
          label={`Show details for ${version.name}`}
          expanded={detailsOpen}
        >
          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              detailsOpen && 'rotate-180',
            )}
          />
        </IconButton>
      )}
      {primaryFile && (
        <IconButton
          onClick={() => onDownload(primaryFile)}
          label={`Download ${version.name}`}
        >
          <Download className="size-4" />
        </IconButton>
      )}
    </div>
  );
}

function IconButton({
  children,
  expanded,
  label,
  onClick,
}: {
  children: ReactNode;
  expanded?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid size-9 place-items-center rounded-lg bg-control text-accent-icon transition-colors hover:bg-control-hover"
      aria-label={label}
      aria-expanded={expanded}
    >
      {children}
    </button>
  );
}
