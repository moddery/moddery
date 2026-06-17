import { useEffect, useState } from 'react';

import { recordDownload, type ProjectVersion } from '../../../lib/catalog.ts';
import { cn } from '../../../lib/cn.ts';
import { VersionActions } from './version-row/VersionActions.tsx';
import { VersionDependencies } from './version-row/VersionDependencies.tsx';
import { VersionFiles } from './version-row/VersionFiles.tsx';
import { VersionReportForm } from './version-row/VersionReportForm.tsx';
import { VersionSummary } from './version-row/VersionSummary.tsx';

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
      <VersionSummary
        version={version}
        primaryFile={primaryFile}
        onSelectVersion={onSelectVersion}
      />

      <VersionActions
        detailsOpen={detailsOpen}
        hasDetails={hasDetails}
        onDownload={(file) => void downloadFile(file)}
        onSelectVersion={onSelectVersion}
        onToggleDetails={toggleDetails}
        onToggleReport={() => setReportOpen((current) => !current)}
        primaryFile={primaryFile}
        version={version}
      />

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
