import { DashboardField } from '../shared.tsx';
import { type VersionChannel } from './versionChannel.ts';

export function EditVersionFields({
  channel,
  changelog,
  gameVersions,
  loaders,
  name,
  versionNumber,
  onChannelChange,
  onChangelogChange,
  onGameVersionsChange,
  onLoadersChange,
  onNameChange,
  onVersionNumberChange,
}: {
  channel: VersionChannel;
  changelog: string;
  gameVersions: string;
  loaders: string;
  name: string;
  versionNumber: string;
  onChannelChange: (value: VersionChannel) => void;
  onChangelogChange: (value: string) => void;
  onGameVersionsChange: (value: string) => void;
  onLoadersChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onVersionNumberChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
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
        <label className="grid gap-1 text-sm font-bold text-ink">
          Channel
          <select
            value={channel}
            onChange={(event) =>
              onChannelChange(event.target.value as VersionChannel)
            }
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            <option value="RELEASE">Release</option>
            <option value="BETA">Beta</option>
            <option value="ALPHA">Alpha</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
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
      <label className="grid gap-1 text-sm font-bold text-ink">
        Changelog
        <textarea
          value={changelog}
          onChange={(event) => onChangelogChange(event.target.value)}
          className="min-h-24 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
        />
      </label>
    </>
  );
}
