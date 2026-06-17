import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  fetchProjectVersionSearch,
  type ProjectVersion,
} from '../../../lib/catalog.ts';
import { Pagination } from '../../Pagination.tsx';
import { EmptyTab } from './EmptyTab.tsx';
import {
  allLoaderFilter,
  allVersionFilter,
  buildGameVersionOptions,
  buildLoaderOptions,
} from './version-filters.ts';
import { VersionRow } from './VersionRow.tsx';
import { VersionsToolbar } from './VersionsToolbar.tsx';

const pageSize = 20;

export function VersionsTab({
  selectedVersion,
  onSelectVersion,
  projectSlug,
  versions,
}: {
  selectedVersion: string | null;
  onSelectVersion: (versionNumber: string | null) => void;
  projectSlug: string;
  versions: ProjectVersion[];
}) {
  const [gameVersion, setGameVersion] = useState(allVersionFilter);
  const [loader, setLoader] = useState(allLoaderFilter);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const gameVersionOptions = useMemo(
    () => buildGameVersionOptions(versions),
    [versions],
  );
  const loaderOptions = useMemo(() => buildLoaderOptions(versions), [versions]);
  const selectedGameVersion =
    gameVersion === allVersionFilter ? null : gameVersion;
  const selectedLoader = loader === allLoaderFilter ? null : loader;
  const versionsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchProjectVersionSearch(
        projectSlug,
        {
          gameVersion: selectedGameVersion,
          limit: pageSize,
          loader: selectedLoader,
          page,
          search: query,
        },
        signal,
      ),
    queryKey: [
      'catalog',
      'project-version-search',
      projectSlug,
      page,
      selectedGameVersion,
      selectedLoader,
      query,
    ],
  });
  const visibleVersions = versionsQuery.data?.versions ?? [];
  const totalHits = versionsQuery.data?.totalHits ?? versions.length;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));

  useEffect(() => {
    setPage(1);
  }, [gameVersion, loader, query]);

  useEffect(() => {
    if (
      gameVersion !== allVersionFilter &&
      !gameVersionOptions.some((option) => option.value === gameVersion)
    ) {
      setGameVersion(allVersionFilter);
    }

    if (
      loader !== allLoaderFilter &&
      !loaderOptions.some((option) => option.value === loader)
    ) {
      setLoader(allLoaderFilter);
    }
  }, [gameVersion, gameVersionOptions, loader, loaderOptions]);

  useEffect(() => {
    if (selectedVersion === null) return;
    if (
      gameVersion !== allVersionFilter ||
      loader !== allLoaderFilter ||
      query.trim() !== ''
    ) {
      return;
    }

    const versionIndex = versions.findIndex(
      (version) => version.version_number === selectedVersion,
    );
    if (versionIndex === -1) return;

    setPage(Math.floor(versionIndex / pageSize) + 1);
  }, [gameVersion, loader, query, selectedVersion, versions]);

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
        filteredCount={totalHits}
        gameVersion={gameVersion}
        gameVersionOptions={gameVersionOptions}
        loader={loader}
        loaderOptions={loaderOptions}
        query={query}
        totalCount={Math.max(totalHits, versions.length)}
        onGameVersionChange={setGameVersion}
        onLoaderChange={setLoader}
        onQueryChange={setQuery}
      />

      {versionsQuery.isLoading ? (
        <div className="py-8 text-sm font-semibold text-muted">
          Loading versions...
        </div>
      ) : versionsQuery.isError ? (
        <div className="py-8 text-sm font-semibold text-danger">
          Versions could not be loaded.
        </div>
      ) : visibleVersions.length ? (
        <div>
          {totalPages > 1 && (
            <div className="border-b border-line py-3">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}

          {visibleVersions.map((version) => (
            <VersionRow
              key={version.id}
              selected={version.version_number === selectedVersion}
              version={version}
              onSelectVersion={onSelectVersion}
            />
          ))}

          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyTab
          title="No matching versions"
          body="There are no files for that version and loader combination."
        />
      )}
    </section>
  );
}
