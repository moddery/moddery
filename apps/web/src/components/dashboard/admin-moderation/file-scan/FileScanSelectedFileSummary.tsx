import { ExternalLink, FileCode2, ShieldAlert } from 'lucide-react';

import { type ProjectFile } from '../../../../lib/catalog.ts';
import { cn } from '../../../../lib/cn.ts';
import { formatBytes, timeAgo } from '../../../../lib/format.ts';
import { scanStatusMeta } from '../../../project/tabs/version-row/scan-status.ts';

export function FileScanSelectedFileSummary({
  file,
}: {
  file: ProjectFile | undefined;
}) {
  if (file === undefined) {
    return (
      <p className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-muted">
        Select a version with files before recording a scan.
      </p>
    );
  }

  return (
    <section className="grid gap-3 rounded-lg border border-line bg-surface p-3 lg:grid-cols-2">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-extrabold text-ink">
            {file.filename}
          </h3>
          {file.primary && (
            <span className="rounded-md bg-control px-2 py-1 text-xs font-bold text-muted">
              Primary
            </span>
          )}
          <span className="rounded-md bg-control px-2 py-1 text-xs font-bold text-muted">
            {file.kind.toLowerCase()}
          </span>
          <span className="text-xs font-bold text-muted">
            {formatBytes(file.size)}
          </span>
        </div>
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex max-w-full items-center gap-2 text-xs font-bold text-accent-icon transition-colors hover:text-accent"
        >
          <ExternalLink className="size-3.5 shrink-0" />
          <span className="truncate">{file.url}</span>
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <FileHashSummary file={file} />
        <FileScanHistory file={file} />
      </div>
    </section>
  );
}

function FileHashSummary({ file }: { file: ProjectFile }) {
  return (
    <div className="rounded-lg bg-control px-3 py-2">
      <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-muted">
        <FileCode2 className="size-4" />
        Hashes
      </div>
      {file.hashes.length === 0 ? (
        <p className="text-xs font-semibold text-muted">No hashes recorded.</p>
      ) : (
        <div className="grid gap-1">
          {file.hashes.map((hash) => (
            <div
              key={hash.algorithm}
              className="grid min-w-0 gap-1 text-xs sm:grid-cols-[4rem_minmax(0,1fr)]"
            >
              <span className="font-bold text-muted">{hash.algorithm}</span>
              <code className="truncate rounded bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink">
                {hash.value}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileScanHistory({ file }: { file: ProjectFile }) {
  const latestScans = latestFileScans(file);

  return (
    <div className="rounded-lg bg-control px-3 py-2">
      <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-muted">
        <ShieldAlert className="size-4" />
        Scan history
      </div>
      {latestScans.length === 0 ? (
        <p className="text-xs font-semibold text-muted">No scans recorded.</p>
      ) : (
        <div className="grid gap-2">
          {latestScans.map((scan) => {
            const meta = scanStatusMeta(scan);

            return (
              <div key={scan.id} className="grid gap-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'font-extrabold',
                      meta.tone === 'clean' && 'text-accent-icon',
                      meta.tone === 'failed' && 'text-danger',
                      meta.tone === 'pending' && 'text-muted',
                      meta.tone === 'warning' && 'text-warning',
                    )}
                  >
                    {meta.label}
                  </span>
                  <span className="font-semibold text-muted">
                    {timeAgo(scan.createdAt)}
                  </span>
                </div>
                {scan.details && (
                  <pre className="max-h-20 overflow-auto rounded bg-surface px-2 py-1.5 font-mono text-[11px] leading-5 text-muted">
                    {scan.details}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function latestFileScans(file: ProjectFile) {
  return [...file.scans]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);
}
