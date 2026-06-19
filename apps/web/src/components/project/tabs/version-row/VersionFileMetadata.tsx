import {
  CheckCircle2,
  Clock3,
  Copy,
  FileCode2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { cn } from '../../../../lib/cn.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { scanStatusMeta } from './scan-status.ts';

type VersionFile = ProjectVersion['files'][number];

export function VersionFileMetadata({ file }: { file: VersionFile }) {
  if (file.hashes.length === 0 && file.scans.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2 md:grid-cols-2">
      {file.hashes.length > 0 && <FileHashes hashes={file.hashes} />}
      {file.scans.length > 0 && <FileScans scans={file.scans} />}
    </div>
  );
}

export function ScanSummary({ scan }: { scan: VersionFile['scans'][number] }) {
  const meta = scanStatusMeta(scan);
  const Icon = scanIcon(meta.tone);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        meta.tone === 'clean' && 'text-accent-icon',
        meta.tone === 'failed' && 'text-danger',
        meta.tone === 'pending' && 'text-muted',
        meta.tone === 'warning' && 'text-warning',
      )}
    >
      <Icon className="size-3.5" />
      Scan {meta.label}
    </span>
  );
}

function FileHashes({ hashes }: { hashes: VersionFile['hashes'] }) {
  return (
    <FileMetadataBlock icon={<FileCode2 className="size-4" />} title="Hashes">
      <div className="grid gap-1">
        {hashes.map((hash) => (
          <div
            key={hash.algorithm}
            className="grid min-w-0 gap-1 text-xs sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center"
          >
            <span className="font-bold text-muted">{hash.algorithm}</span>
            <code className="truncate rounded bg-control px-1.5 py-0.5 font-mono text-[11px] text-ink">
              {hash.value}
            </code>
            <CopyHashButton value={hash.value} />
          </div>
        ))}
      </div>
    </FileMetadataBlock>
  );
}

function CopyHashButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copyHash() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={() => void copyHash()}
      className="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-line px-2 text-[11px] font-bold text-muted transition-colors hover:bg-control-hover hover:text-accent"
    >
      <Copy className="size-3.5" />
      {copied ? 'Copied' : 'Copy'}
    </button>
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

function scanIcon(tone: ReturnType<typeof scanStatusMeta>['tone']) {
  if (tone === 'clean') return ShieldCheck;
  if (tone === 'failed') return ShieldAlert;
  if (tone === 'pending') return Clock3;
  return CheckCircle2;
}
