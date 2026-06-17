import { CheckCircle2, Download, FileCode2, ShieldAlert } from 'lucide-react';
import { type ReactNode } from 'react';

import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { formatBytes, timeAgo } from '../../../../lib/format.ts';
import { Chip } from '../../../Chips.tsx';
import { shortHash } from './helpers.ts';

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
          {file.hashes.slice(0, 3).map((hash) => (
            <span key={hash.algorithm}>
              {hash.algorithm} {shortHash(hash.value)}
            </span>
          ))}
        </div>

        {(file.hashes.length > 0 || file.scans.length > 0) && (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {file.hashes.length > 0 && <FileHashes hashes={file.hashes} />}
            {file.scans.length > 0 && <FileScans scans={file.scans} />}
          </div>
        )}
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

function FileHashes({ hashes }: { hashes: VersionFile['hashes'] }) {
  return (
    <FileMetadataBlock icon={<FileCode2 className="size-4" />} title="Hashes">
      <div className="grid gap-1">
        {hashes.map((hash) => (
          <div
            key={hash.algorithm}
            className="grid min-w-0 gap-1 text-xs sm:grid-cols-[5rem_minmax(0,1fr)]"
          >
            <span className="font-bold text-muted">{hash.algorithm}</span>
            <code className="truncate rounded bg-control px-1.5 py-0.5 font-mono text-[11px] text-ink">
              {hash.value}
            </code>
          </div>
        ))}
      </div>
    </FileMetadataBlock>
  );
}

function FileScans({ scans }: { scans: VersionFile['scans'] }) {
  return (
    <FileMetadataBlock icon={<ShieldAlert className="size-4" />} title="Scans">
      <div className="grid gap-2">
        {scans.map((scan) => (
          <div key={scan.id} className="grid gap-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-ink">
                {scan.verdict ?? scan.status}
              </span>
              <span className="font-semibold text-muted">
                {timeAgo(scan.createdAt)}
              </span>
            </div>
            {scan.details && (
              <pre className="max-h-24 overflow-auto rounded bg-control px-2 py-1.5 font-mono text-[11px] font-medium leading-5 text-muted">
                {scan.details}
              </pre>
            )}
          </div>
        ))}
      </div>
    </FileMetadataBlock>
  );
}

function FileMetadataBlock({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
      <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-muted">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function ScanSummary({ scan }: { scan: VersionFile['scans'][number] }) {
  const label = scan.verdict ?? scan.status;
  const clean = label.toLowerCase().includes('clean');

  return (
    <span className="inline-flex items-center gap-1">
      <CheckCircle2
        className={clean ? 'size-3.5 text-accent-icon' : 'size-3.5 text-muted'}
      />
      Scan {label}
    </span>
  );
}

function fileKindLabel(kind: VersionFile['kind']): string {
  if (kind === 'CLIENT') return 'Client';
  if (kind === 'SERVER') return 'Server';
  return 'Universal';
}
