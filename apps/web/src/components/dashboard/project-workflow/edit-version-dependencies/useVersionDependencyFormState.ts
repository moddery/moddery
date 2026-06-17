import { useQuery } from '@tanstack/react-query';
import { type DependencyKind } from '@moddery/shared';
import { useEffect, useState } from 'react';

import {
  type DashboardData,
  type UpdateVersionDependenciesInput,
} from '../../../../lib/dashboard.ts';
import {
  fetchProjectVersions,
  type ProjectVersion,
} from '../../../../lib/catalog.ts';
import { nullableText } from '../shared.tsx';

export function useVersionDependencyFormState(
  projects: DashboardData['projects'],
) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const versionsQuery = useQuery({
    queryFn: ({ signal }) => fetchProjectVersions(projectSlug, signal),
    queryKey: ['dashboard', 'version-dependencies', projectSlug],
  });
  const versions = versionsQuery.data ?? [];
  const [versionId, setVersionId] = useState('');
  const selectedVersion =
    versions.find((version) => version.id === versionId) ?? versions[0] ?? null;
  const [dependencyKind, setDependencyKind] =
    useState<DependencyKind>('REQUIRED');
  const [targetProjectSlug, setTargetProjectSlug] = useState('');
  const [targetVersionId, setTargetVersionId] = useState('');
  const [externalFileName, setExternalFileName] = useState('');

  useEffect(() => {
    if (versionId === '' && versions[0]) {
      selectVersion(versions[0]);
    }
  }, [versionId, versions]);

  function selectProject(slug: string) {
    setProjectSlug(slug);
    setVersionId('');
    fillDependencyForm(null);
  }

  function selectVersion(version: ProjectVersion | null) {
    fillDependencyForm(version);
  }

  function fillDependencyForm(version: ProjectVersion | null) {
    const dependency = version?.dependencies[0];
    setVersionId(version?.id ?? '');
    setDependencyKind(dependency?.dependencyKind ?? 'REQUIRED');
    setTargetProjectSlug(dependency?.targetProject?.slug ?? '');
    setTargetVersionId(dependency?.targetVersion?.id ?? '');
    setExternalFileName(dependency?.externalFileName ?? '');
  }

  const fields = {
    dependencyKind,
    externalFileName,
    targetProjectSlug,
    targetVersionId,
    onDependencyKindChange: setDependencyKind,
    onExternalFileNameChange: setExternalFileName,
    onTargetProjectSlugChange: setTargetProjectSlug,
    onTargetVersionIdChange: setTargetVersionId,
  };

  function buildInput(): UpdateVersionDependenciesInput | null {
    if (selectedVersion === null) return null;

    const hasDependency =
      targetProjectSlug.trim() !== '' ||
      targetVersionId.trim() !== '' ||
      externalFileName.trim() !== '';

    return {
      dependencies: hasDependency
        ? [
            {
              dependencyKind,
              externalFileName: nullableText(externalFileName),
              targetProjectSlug: nullableText(targetProjectSlug),
              targetVersionId: nullableText(targetVersionId),
            },
          ]
        : [],
      versionId: selectedVersion.id,
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
