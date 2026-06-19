import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  fetchManagedProjectVersions,
  type DashboardData,
  type DashboardVersion,
  type UpdateVersionInput,
} from '../../../../lib/dashboard.ts';
import {
  type VersionChannel,
  versionChannelFromDashboardVersion,
  versionSortOrderFieldValue,
  versionSortOrderFromField,
} from './versionChannel.ts';

export function useEditVersionFormState(projects: DashboardData['projects']) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const versionsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchManagedProjectVersions(projectSlug, 1, 100, signal),
    queryKey: ['dashboard', 'versions', projectSlug],
  });
  const versions = versionsQuery.data?.versions ?? [];
  const [versionId, setVersionId] = useState('');
  const selectedVersion =
    versions.find((version) => version.id === versionId) ?? versions[0] ?? null;
  const [name, setName] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [channel, setChannel] = useState<VersionChannel>('RELEASE');
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');
  const [changelog, setChangelog] = useState('');
  const [loaders, setLoaders] = useState<string[]>([]);
  const [gameVersions, setGameVersions] = useState<string[]>([]);

  useEffect(() => {
    if (versionId === '' && versions[0]) {
      selectVersion(versions[0]);
    }
  }, [versionId, versions]);

  function selectProject(slug: string) {
    setProjectSlug(slug);
    setVersionId('');
    fillVersion(null);
  }

  function selectVersion(version: DashboardVersion | null) {
    setVersionId(version?.id ?? '');
    fillVersion(version);
  }

  function fillVersion(version: DashboardVersion | null) {
    setName(version?.name ?? '');
    setVersionNumber(version?.versionNumber ?? '');
    setChannel(versionChannelFromDashboardVersion(version));
    setFeatured(version?.featured ?? false);
    setSortOrder(versionSortOrderFieldValue(version));
    setChangelog(version?.changelog ?? '');
    setLoaders(version?.loaders ?? []);
    setGameVersions(version?.gameVersions ?? []);
  }

  const fields = {
    channel,
    changelog,
    featured,
    gameVersions,
    loaders,
    name,
    sortOrder,
    versionNumber,
    onChannelChange: setChannel,
    onChangelogChange: setChangelog,
    onFeaturedChange: setFeatured,
    onGameVersionsChange: setGameVersions,
    onLoadersChange: setLoaders,
    onNameChange: setName,
    onSortOrderChange: setSortOrder,
    onVersionNumberChange: setVersionNumber,
  };

  function buildInput(): UpdateVersionInput | null {
    if (selectedVersion === null) return null;

    return {
      changelog: changelog.trim() || null,
      channel,
      featured,
      gameVersions,
      loaders,
      name,
      sortOrder: versionSortOrderFromField(sortOrder),
      versionId: selectedVersion.id,
      versionNumber,
    };
  }

  return {
    buildInput,
    fields,
    projectSlug,
    selectedVersion,
    selectProject,
    selectVersion,
    versions,
    versionsQuery,
  };
}
