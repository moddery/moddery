import { useState } from 'react';

import {
  type CreateVersionInput,
  type DashboardData,
} from '../../../../lib/dashboard.ts';
import { splitList, versionFileHashes } from '../shared.tsx';

export function usePublishVersionFormState(
  projects: DashboardData['projects'],
) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const [name, setName] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [channel, setChannel] =
    useState<CreateVersionInput['channel']>('RELEASE');
  const [changelog, setChangelog] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('0');
  const [sha1, setSha1] = useState('');
  const [sha256, setSha256] = useState('');
  const [loaders, setLoaders] = useState(projects[0]?.loaders.join(', ') ?? '');
  const [gameVersions, setGameVersions] = useState(
    projects[0]?.gameVersions.join(', ') ?? '',
  );

  const fields = {
    channel,
    changelog,
    fileName,
    fileSize,
    fileUrl,
    gameVersions,
    loaders,
    name,
    projectSlug,
    projects,
    sha1,
    sha256,
    versionNumber,
    onChannelChange: setChannel,
    onChangelogChange: setChangelog,
    onFileNameChange: setFileName,
    onFileSizeChange: setFileSize,
    onFileUrlChange: setFileUrl,
    onGameVersionsChange: setGameVersions,
    onLoadersChange: setLoaders,
    onNameChange: setName,
    onProjectSlugChange: setProjectSlug,
    onSha1Change: setSha1,
    onSha256Change: setSha256,
    onVersionNumberChange: setVersionNumber,
  };

  function buildInput(): CreateVersionInput {
    return {
      changelog: changelog.trim() || null,
      channel,
      files: [
        {
          fileName,
          hashes: versionFileHashes({ sha1, sha256 }),
          primary: true,
          sizeBytes: Number(fileSize),
          url: fileUrl,
        },
      ],
      gameVersions: splitList(gameVersions),
      loaders: splitList(loaders),
      name,
      projectSlug,
      versionNumber,
    };
  }

  function reset() {
    setName('');
    setVersionNumber('');
    setChangelog('');
    setFileName('');
    setFileUrl('');
    setFileSize('0');
    setSha1('');
    setSha256('');
  }

  return { buildInput, fields, reset };
}
