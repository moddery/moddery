import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { type DashboardProject } from '../../../../lib/dashboard.ts';
import { fetchProjectVersions } from '../../../../lib/catalog.ts';

export function useFileScanFormState(projects: DashboardProject[]) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const versionsQuery = useQuery({
    enabled: projectSlug !== '',
    queryFn: ({ signal }) => fetchProjectVersions(projectSlug, signal),
    queryKey: ['dashboard', 'file-scans', projectSlug],
  });
  const versions = versionsQuery.data ?? [];
  const [versionId, setVersionId] = useState('');
  const selectedVersion =
    versions.find((version) => version.id === versionId) ?? versions[0] ?? null;
  const files = selectedVersion?.files ?? [];
  const [fileId, setFileId] = useState('');
  const selectedFile = files.find((file) => file.id === fileId) ?? files[0];
  const [status, setStatus] = useState('COMPLETE');
  const [verdict, setVerdict] = useState('CLEAN');
  const [details, setDetails] = useState('{\n  "source": "manual"\n}');

  useEffect(() => {
    setVersionId(versions[0]?.id ?? '');
  }, [versions]);

  useEffect(() => {
    setFileId(files[0]?.id ?? '');
  }, [files]);

  return {
    details,
    fileId,
    files,
    projectSlug,
    selectedFile,
    selectedVersion,
    status,
    verdict,
    versionId,
    versions,
    versionsQuery,
    onDetailsChange: setDetails,
    onFileChange: setFileId,
    onProjectChange: setProjectSlug,
    onStatusChange: setStatus,
    onVerdictChange: setVerdict,
    onVersionChange: setVersionId,
  };
}
