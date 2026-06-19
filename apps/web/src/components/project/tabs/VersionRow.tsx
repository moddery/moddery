import { useEffect, useState } from 'react';

import {
  downloadProjectFile,
  type ProjectVersion,
} from '../../../lib/catalog.ts';
import { type ProjectType } from '../../../types.ts';
import { cn } from '../../../lib/cn.ts';
import { type SearchTag } from '../../ModCard.tsx';
import { VersionActions } from './version-row/VersionActions.tsx';
import { VersionChangelog } from './version-row/VersionChangelog.tsx';
import { VersionDependencies } from './version-row/VersionDependencies.tsx';
import { VersionFiles } from './version-row/VersionFiles.tsx';
import { VersionMetadata } from './version-row/VersionMetadata.tsx';
import { VersionReportForm } from './version-row/VersionReportForm.tsx';
import { VersionSummary } from './version-row/VersionSummary.tsx';

export function VersionRow({
  onRequestAuth,
  onSelectVersion,
  onTagSearch,
  projectType,
  selected,
  version,
}: {
  onRequestAuth?: () => void;
  onSelectVersion: (versionNumber: string | null) => void;
  onTagSearch?: (tag: SearchTag) => void;
  projectType: ProjectType;
  selected: boolean;
  version: ProjectVersion;
}) {
  const primaryFile =
    version.files.find((file) => file.primary) ?? version.files[0];
  const [reportOpen, setReportOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(selected);
  const hasDetails = true;

  function downloadFile(file: ProjectVersion['files'][number]) {
    downloadProjectFile({ file });
  }

  useEffect(() => {
    setDetailsOpen(selected);
  }, [selected]);

  function toggleDetails() {
    const nextOpen = !detailsOpen;
    setDetailsOpen(nextOpen);
    onSelectVersion(nextOpen ? version.versionNumber : null);
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
        onTagSearch={onTagSearch}
        projectType={projectType}
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
            onRequestAuth={onRequestAuth}
            onSubmitted={() => setReportOpen(false)}
          />
        </div>
      )}

      {detailsOpen && (
        <div className="grid gap-3 sm:col-span-2">
          <VersionMetadata
            version={version}
            onTagSearch={onTagSearch}
            projectType={projectType}
          />
          <VersionChangelog changelog={version.changelog} />
          <VersionDependencies dependencies={version.dependencies} />
          <VersionFiles files={version.files} onDownload={downloadFile} />
        </div>
      )}
    </div>
  );
}
