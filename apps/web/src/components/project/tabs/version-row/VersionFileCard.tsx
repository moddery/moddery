import { Download } from 'lucide-react';

import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { formatBytes } from '../../../../lib/format.ts';
import { Chip } from '../../../Chips.tsx';
import { fileHashPreview, fileKindLabel } from './version-file-labels.ts';
import { ScanSummary, VersionFileMetadata } from './VersionFileMetadata.tsx';

type VersionFile = ProjectVersion['files'][number];

export function VersionFileCard({
  file,
  onDownload,
}: {
  file: VersionFile;
  onDownload: (file: VersionFile) => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-line bg-surface px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-ink">{file.filename}</p>
          {file.primary && <Chip>Primary</Chip>}
          <Chip>{fileKindLabel(file.kind)}</Chip>
          <span className="text-xs font-bold text-muted">
            {formatBytes(file.size)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-muted">
          {file.scans[0] && <ScanSummary scan={file.scans[0]} />}
          {fileHashPreview(file.hashes).map((hash) => (
            <span key={hash}>{hash}</span>
          ))}
        </div>

        <VersionFileMetadata file={file} />
      </div>

      <button
        type="button"
        onClick={() => onDownload(file)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-control px-3 text-sm font-bold text-accent-icon transition-colors hover:bg-control-hover"
      >
        <Download className="size-4" />
        Download
      </button>
    </div>
  );
}
