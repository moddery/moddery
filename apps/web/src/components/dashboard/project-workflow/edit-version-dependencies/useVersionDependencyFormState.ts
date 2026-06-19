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

export interface DependencyDraft {
  dependencyKind: DependencyKind;
  externalFileName: string;
  key: string;
  targetProjectSlug: string;
  targetVersionId: string;
}

type DependencyDraftPatch = Partial<Omit<DependencyDraft, 'key'>>;

export function dependencyExternalFilePatch(
  externalFileName: string,
): DependencyDraftPatch {
  return externalFileName.trim().length === 0
    ? { externalFileName }
    : {
        externalFileName,
        targetProjectSlug: '',
        targetVersionId: '',
      };
}

export function dependencyProjectPatch(
  targetProjectSlug: string,
): DependencyDraftPatch {
  return targetProjectSlug.trim().length === 0
    ? { targetProjectSlug, targetVersionId: '' }
    : {
        externalFileName: '',
        targetProjectSlug,
        targetVersionId: '',
      };
}

export function dependencyVersionPatch(
  targetVersionId: string,
): DependencyDraftPatch {
  return targetVersionId.trim().length === 0
    ? { targetVersionId }
    : {
        externalFileName: '',
        targetVersionId,
      };
}

export function dependencyInputTargetFields(
  dependency: DependencyDraft,
): Pick<
  UpdateVersionDependenciesInput['dependencies'][number],
  'externalFileName' | 'targetProjectSlug' | 'targetVersionId'
> {
  const externalFileName = nullableText(dependency.externalFileName);
  const targetProjectSlug = nullableText(dependency.targetProjectSlug);
  const targetVersionId = nullableText(dependency.targetVersionId);

  if (targetVersionId !== null) {
    return {
      externalFileName: null,
      targetProjectSlug: null,
      targetVersionId,
    };
  }

  if (externalFileName !== null) {
    return {
      externalFileName,
      targetProjectSlug: null,
      targetVersionId: null,
    };
  }

  return {
    externalFileName: null,
    targetProjectSlug,
    targetVersionId: null,
  };
}

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
  const [dependencies, setDependencies] = useState<DependencyDraft[]>([
    createDependencyDraft(),
  ]);

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
    setVersionId(version?.id ?? '');
    setDependencies(
      version?.dependencies.length
        ? version.dependencies.map((dependency) =>
            createDependencyDraft({
              dependencyKind: dependency.dependencyKind,
              externalFileName: dependency.externalFileName ?? '',
              key: dependency.id,
              targetProjectSlug: dependency.targetProject?.slug ?? '',
              targetVersionId: dependency.targetVersion?.id ?? '',
            }),
          )
        : [createDependencyDraft()],
    );
  }

  function addDependency() {
    setDependencies((current) => [...current, createDependencyDraft()]);
  }

  function removeDependency(key: string) {
    setDependencies((current) => {
      const next = current.filter((dependency) => dependency.key !== key);
      return next.length > 0 ? next : [createDependencyDraft()];
    });
  }

  function updateDependency(
    key: string,
    patch: Partial<Omit<DependencyDraft, 'key'>>,
  ) {
    setDependencies((current) =>
      current.map((dependency) =>
        dependency.key === key ? { ...dependency, ...patch } : dependency,
      ),
    );
  }

  const fields = {
    dependencies,
    onAddDependency: addDependency,
    onRemoveDependency: removeDependency,
    onUpdateDependency: updateDependency,
  };

  function buildInput(): UpdateVersionDependenciesInput | null {
    if (selectedVersion === null) return null;

    const filledDependencies = dependencies
      .map((dependency) => ({
        dependencyKind: dependency.dependencyKind,
        ...dependencyInputTargetFields(dependency),
      }))
      .filter(
        (dependency) =>
          dependency.externalFileName !== null ||
          dependency.targetProjectSlug !== null ||
          dependency.targetVersionId !== null,
      );

    return {
      dependencies: filledDependencies,
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

function createDependencyDraft(
  overrides: Partial<DependencyDraft> = {},
): DependencyDraft {
  return {
    dependencyKind: 'REQUIRED',
    externalFileName: '',
    key: `dependency-${String(Date.now())}-${Math.random()
      .toString(36)
      .slice(2)}`,
    targetProjectSlug: '',
    targetVersionId: '',
    ...overrides,
  };
}
