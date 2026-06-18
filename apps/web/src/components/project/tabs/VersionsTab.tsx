import {
  type DownloadRecord,
  type ProjectVersion,
} from '../../../lib/catalog.ts';
import { EmptyTab } from './EmptyTab.tsx';
import { useVersionSearchState } from './versions-tab/useVersionSearchState.ts';
import { VersionSearchResults } from './versions-tab/VersionSearchResults.tsx';
import { VersionsToolbar } from './VersionsToolbar.tsx';

export function VersionsTab({
  onDownloadRecorded,
  selectedVersion,
  onSelectVersion,
  projectSlug,
  versions,
}: {
  onDownloadRecorded: (record: DownloadRecord) => void;
  selectedVersion: string | null;
  onSelectVersion: (versionNumber: string | null) => void;
  projectSlug: string;
  versions: ProjectVersion[];
}) {
  const search = useVersionSearchState({
    projectSlug,
    selectedVersion,
    versions,
  });

  if (!versions.length) {
    return (
      <EmptyTab
        title="No versions yet"
        body="This project does not have published files yet."
      />
    );
  }

  return (
    <section aria-label="Versions">
      <VersionsToolbar
        filteredCount={search.totalHits}
        gameVersion={search.gameVersion}
        gameVersionOptions={search.gameVersionOptions}
        loader={search.loader}
        loaderOptions={search.loaderOptions}
        query={search.query}
        totalCount={Math.max(search.totalHits, versions.length)}
        onGameVersionChange={search.setGameVersion}
        onLoaderChange={search.setLoader}
        onQueryChange={search.setQuery}
      />

      <VersionSearchResults
        isError={search.versionsQuery.isError}
        isLoading={search.versionsQuery.isLoading}
        page={search.page}
        selectedVersion={selectedVersion}
        totalPages={search.totalPages}
        versions={search.visibleVersions}
        onDownloadRecorded={onDownloadRecorded}
        onPage={search.setPage}
        onSelectVersion={onSelectVersion}
      />
    </section>
  );
}
