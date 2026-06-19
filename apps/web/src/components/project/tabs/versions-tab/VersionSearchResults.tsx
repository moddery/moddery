import {
  type DownloadRecord,
  type ProjectVersion,
} from '../../../../lib/catalog.ts';
import { type ProjectType } from '../../../../types.ts';
import { type SearchTag } from '../../../ModCard.tsx';
import { Pagination } from '../../../Pagination.tsx';
import { EmptyTab } from '../EmptyTab.tsx';
import { VersionRow } from '../VersionRow.tsx';

export function VersionSearchResults({
  isError,
  isLoading,
  onDownloadRecorded,
  onPage,
  onRequestAuth,
  onSelectVersion,
  onTagSearch,
  page,
  projectType,
  selectedVersion,
  totalPages,
  versions,
}: {
  isError: boolean;
  isLoading: boolean;
  onDownloadRecorded: (record: DownloadRecord) => void;
  onPage: (page: number) => void;
  onRequestAuth?: () => void;
  onSelectVersion: (versionNumber: string | null) => void;
  onTagSearch?: (tag: SearchTag) => void;
  page: number;
  projectType: ProjectType;
  selectedVersion: string | null;
  totalPages: number;
  versions: ProjectVersion[];
}) {
  if (isLoading) {
    return (
      <div className="py-8 text-sm font-semibold text-muted">
        Loading versions...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-sm font-semibold text-danger">
        Versions could not be loaded.
      </div>
    );
  }

  if (!versions.length) {
    return (
      <EmptyTab
        title="No matching versions"
        body="There are no files for that version and loader combination."
      />
    );
  }

  return (
    <div>
      {totalPages > 1 && (
        <div className="border-b border-line py-3">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}

      {versions.map((version) => (
        <VersionRow
          key={version.id}
          selected={version.versionNumber === selectedVersion}
          version={version}
          onDownloadRecorded={onDownloadRecorded}
          onRequestAuth={onRequestAuth}
          onSelectVersion={onSelectVersion}
          onTagSearch={onTagSearch}
          projectType={projectType}
        />
      ))}

      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </div>
  );
}
