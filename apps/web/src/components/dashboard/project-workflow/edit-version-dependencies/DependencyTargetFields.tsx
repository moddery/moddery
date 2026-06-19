import { useQuery } from '@tanstack/react-query';
import { useId } from 'react';

import { type DashboardData } from '../../../../lib/dashboard.ts';
import { fetchProjectVersions } from '../../../../lib/catalog.ts';
import { DashboardField } from '../shared.tsx';
import { type DependencyDraft } from './useVersionDependencyFormState.ts';

export function DependencyTargetFields({
  dependency,
  disabled,
  projects,
  onUpdateDependency,
}: {
  dependency: DependencyDraft;
  disabled?: boolean;
  projects: DashboardData['projects'];
  onUpdateDependency: (
    key: string,
    patch: Partial<Omit<DependencyDraft, 'key'>>,
  ) => void;
}) {
  const projectListId = useId();
  const targetProjectSlug = dependency.targetProjectSlug.trim();
  const versionsQuery = useQuery({
    enabled: targetProjectSlug.length > 0,
    queryFn: ({ signal }) => fetchProjectVersions(targetProjectSlug, signal),
    queryKey: ['dashboard', 'dependency-target-versions', targetProjectSlug],
  });
  const versions = versionsQuery.data ?? [];
  const selectedVersion = versions.find(
    (version) => version.id === dependency.targetVersionId,
  );
  const hasUnknownSelectedVersion =
    dependency.targetVersionId.trim().length > 0 &&
    selectedVersion === undefined;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <label className="grid gap-1 text-sm font-bold text-ink">
        Target project slug
        <input
          disabled={disabled}
          list={projectListId}
          value={dependency.targetProjectSlug}
          onChange={(event) =>
            onUpdateDependency(dependency.key, {
              targetProjectSlug: event.target.value,
              targetVersionId: '',
            })
          }
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        />
        <datalist id={projectListId}>
          {projects.map((project) => (
            <option key={project.slug} value={project.slug}>
              {project.title}
            </option>
          ))}
        </datalist>
      </label>

      <label className="grid gap-1 text-sm font-bold text-ink">
        Target version
        <select
          value={dependency.targetVersionId}
          disabled={
            disabled ||
            targetProjectSlug.length === 0 ||
            versionsQuery.isLoading ||
            versionsQuery.isError
          }
          onChange={(event) =>
            onUpdateDependency(dependency.key, {
              targetVersionId: event.target.value,
            })
          }
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {targetProjectSlug.length === 0
              ? 'Select project first'
              : versionsQuery.isLoading
                ? 'Loading versions...'
                : versionsQuery.isError
                  ? 'Project not found'
                  : 'Project-level dependency'}
          </option>
          {hasUnknownSelectedVersion && (
            <option value={dependency.targetVersionId}>
              Current version {dependency.targetVersionId}
            </option>
          )}
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.name} {version.versionNumber}
            </option>
          ))}
        </select>
      </label>

      <DashboardField
        disabled={disabled}
        label="External file"
        value={dependency.externalFileName}
        onChange={(value) =>
          onUpdateDependency(dependency.key, {
            externalFileName: value,
          })
        }
      />
    </div>
  );
}
