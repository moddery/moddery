import { SUPPORTED_LOADERS } from '@moddery/shared';

import { type CreateVersionInput } from '../../../../lib/dashboard.ts';
import { enumLabel } from '../../../../lib/labels.ts';
import { TaxonomyCheckboxGroup } from '../../TaxonomyCheckboxGroup.tsx';
import { DashboardField } from '../shared.tsx';
import { type PublishVersionFieldsProps } from './PublishVersionFields.types.ts';

type MetadataFieldsProps = Pick<
  PublishVersionFieldsProps,
  | 'channel'
  | 'disabled'
  | 'gameVersionOptions'
  | 'gameVersions'
  | 'loaders'
  | 'name'
  | 'projectSlug'
  | 'projects'
  | 'versionNumber'
  | 'onChannelChange'
  | 'onGameVersionsChange'
  | 'onLoadersChange'
  | 'onNameChange'
  | 'onProjectSlugChange'
  | 'onVersionNumberChange'
>;

export function PublishVersionMetadataFields({
  channel,
  disabled,
  gameVersionOptions,
  gameVersions,
  loaders,
  name,
  projectSlug,
  projects,
  versionNumber,
  onChannelChange,
  onGameVersionsChange,
  onLoadersChange,
  onNameChange,
  onProjectSlugChange,
  onVersionNumberChange,
}: MetadataFieldsProps) {
  const activeGameVersions = gameVersionOptions.filter(
    (version) => version.isActive,
  );

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            disabled={disabled}
            value={projectSlug}
            onChange={(event) => onProjectSlugChange(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <DashboardField
          disabled={disabled}
          label="Name"
          value={name}
          onChange={onNameChange}
          required
        />
        <DashboardField
          disabled={disabled}
          label="Version number"
          value={versionNumber}
          onChange={onVersionNumberChange}
          required
        />
      </div>
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Channel
          <select
            disabled={disabled}
            value={channel}
            onChange={(event) =>
              onChannelChange(
                event.target.value as CreateVersionInput['channel'],
              )
            }
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="RELEASE">Release</option>
            <option value="BETA">Beta</option>
            <option value="ALPHA">Alpha</option>
          </select>
        </label>
        <TaxonomyCheckboxGroup
          disabled={disabled}
          label="Loaders"
          options={SUPPORTED_LOADERS.map((loader) => ({
            label: enumLabel(loader),
            value: loader,
          }))}
          selected={loaders}
          onChange={onLoadersChange}
        />
        <TaxonomyCheckboxGroup
          disabled={disabled}
          label="Game versions"
          options={activeGameVersions.map((version) => ({
            label: version.version,
            value: version.version,
          }))}
          selected={gameVersions}
          onChange={onGameVersionsChange}
        />
      </div>
    </>
  );
}
