import { useEffect, useMemo, useState } from 'react';

import { type ProjectVersion } from '../../../lib/catalog.ts';
import { EmptyTab } from './EmptyTab.tsx';
import {
  allLoaderFilter,
  allVersionFilter,
  buildGameVersionOptions,
  buildLoaderOptions,
  filterProjectVersions,
} from './version-filters.ts';
import { VersionRow } from './VersionRow.tsx';
import { VersionsToolbar } from './VersionsToolbar.tsx';

export function VersionsTab({ versions }: { versions: ProjectVersion[] }) {
  const [gameVersion, setGameVersion] = useState(allVersionFilter);
  const [loader, setLoader] = useState(allLoaderFilter);
  const [query, setQuery] = useState('');
  const gameVersionOptions = useMemo(
    () => buildGameVersionOptions(versions),
    [versions],
  );
  const loaderOptions = useMemo(() => buildLoaderOptions(versions), [versions]);
  const filteredVersions = useMemo(
    () => filterProjectVersions(versions, gameVersion, loader, query),
    [versions, gameVersion, loader, query],
  );

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
        filteredCount={filteredVersions.length}
        gameVersion={gameVersion}
        gameVersionOptions={gameVersionOptions}
        loader={loader}
        loaderOptions={loaderOptions}
        query={query}
        totalCount={versions.length}
        onGameVersionChange={setGameVersion}
        onLoaderChange={setLoader}
        onQueryChange={setQuery}
      />

      {filteredVersions.length ? (
        <div>
          {filteredVersions.map((version) => (
            <VersionRow key={version.id} version={version} />
          ))}
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
