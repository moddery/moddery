import { type CreateVersionInput } from '../../../../lib/dashboard.ts';
import { DashboardField } from '../shared.tsx';
import { type PublishVersionFieldsProps } from './PublishVersionFields.types.ts';

type MetadataFieldsProps = Pick<
  PublishVersionFieldsProps,
  | 'channel'
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
  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => onProjectSlugChange(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <DashboardField
          label="Name"
          value={name}
          onChange={onNameChange}
          required
        />
        <DashboardField
          label="Version number"
          value={versionNumber}
          onChange={onVersionNumberChange}
          required
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Channel
          <select
            value={channel}
            onChange={(event) =>
              onChannelChange(
                event.target.value as CreateVersionInput['channel'],
              )
            }
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            <option value="RELEASE">Release</option>
            <option value="BETA">Beta</option>
            <option value="ALPHA">Alpha</option>
          </select>
        </label>
        <DashboardField
          label="Loaders"
          value={loaders}
          onChange={onLoadersChange}
        />
        <DashboardField
          label="Game versions"
          value={gameVersions}
          onChange={onGameVersionsChange}
        />
      </div>
    </>
  );
}
