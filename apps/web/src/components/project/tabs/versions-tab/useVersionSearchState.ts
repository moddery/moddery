import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  fetchProjectVersionSearch,
  type ProjectVersion,
} from '../../../../lib/catalog.ts';
import {
  allLoaderFilter,
  allVersionFilter,
  buildGameVersionOptions,
  buildLoaderOptions,
} from '../version-filters.ts';

export const versionSearchPageSize = 20;

export function useVersionSearchState({
  projectSlug,
  selectedVersion,
  versions,
}: {
  projectSlug: string;
  selectedVersion: string | null;
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
          limit: versionSearchPageSize,
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
  const totalPages = Math.max(1, Math.ceil(totalHits / versionSearchPageSize));

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

    setPage(Math.floor(versionIndex / versionSearchPageSize) + 1);
  }, [gameVersion, loader, query, selectedVersion, versions]);

  return {
    gameVersion,
    gameVersionOptions,
    loader,
    loaderOptions,
    page,
    query,
    setGameVersion,
    setLoader,
    setPage,
    setQuery,
    totalHits,
    totalPages,
    versionsQuery,
    visibleVersions,
  };
}
