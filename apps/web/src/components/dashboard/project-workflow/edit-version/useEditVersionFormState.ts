import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  type DashboardData,
  type UpdateVersionInput,
} from '../../../../lib/dashboard.ts';
import {
  fetchProjectVersions,
  type ProjectVersion,
} from '../../../../lib/catalog.ts';
import { splitList } from '../shared.tsx';
import {
  type VersionChannel,
  versionChannelFromProjectVersion,
} from './versionChannel.ts';

export function useEditVersionFormState(projects: DashboardData['projects']) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const versionsQuery = useQuery({
    queryFn: ({ signal }) => fetchProjectVersions(projectSlug, signal),
    queryKey: ['dashboard', 'versions', projectSlug],
  });
  const versions = versionsQuery.data ?? [];
  const [versionId, setVersionId] = useState('');
  const selectedVersion =
    versions.find((version) => version.id === versionId) ?? versions[0] ?? null;
  const [name, setName] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [channel, setChannel] = useState<VersionChannel>('RELEASE');
  const [changelog, setChangelog] = useState('');
  const [loaders, setLoaders] = useState('');
  const [gameVersions, setGameVersions] = useState('');

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

  function selectVersion(version: ProjectVersion | null) {
    setVersionId(version?.id ?? '');
    fillVersion(version);
  }

  function fillVersion(version: ProjectVersion | null) {
    setName(version?.name ?? '');
    setVersionNumber(version?.version_number ?? '');
    setChannel(versionChannelFromProjectVersion(version));
    setChangelog(version?.changelog ?? '');
    setLoaders(version?.loaders.join(', ') ?? '');
    setGameVersions(version?.game_versions.join(', ') ?? '');
  }

  const fields = {
    channel,
    changelog,
    gameVersions,
    loaders,
    name,
    versionNumber,
    onChannelChange: setChannel,
    onChangelogChange: setChangelog,
    onGameVersionsChange: setGameVersions,
    onLoadersChange: setLoaders,
    onNameChange: setName,
    onVersionNumberChange: setVersionNumber,
  };

  function buildInput(): UpdateVersionInput | null {
    if (selectedVersion === null) return null;

    return {
      changelog: changelog.trim() || null,
      channel,
      gameVersions: splitList(gameVersions),
      loaders: splitList(loaders),
      name,
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
