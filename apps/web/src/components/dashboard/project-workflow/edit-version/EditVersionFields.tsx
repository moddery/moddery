import { SUPPORTED_LOADERS, VERSION_CHANNELS } from '@moddery/shared';

import { type GameVersionTaxonomy } from '../../../../lib/dashboard.ts';
import { enumLabel } from '../../../../lib/labels.ts';
import { TaxonomyCheckboxGroup } from '../../TaxonomyCheckboxGroup.tsx';
import { DashboardField } from '../shared.tsx';
import { type VersionChannel } from './versionChannel.ts';

export function EditVersionFields({
  channel,
  changelog,
  gameVersionOptions,
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
  gameVersionOptions: GameVersionTaxonomy[];
  gameVersions: string[];
  loaders: string[];
  name: string;
  versionNumber: string;
  onChannelChange: (value: VersionChannel) => void;
  onChangelogChange: (value: string) => void;
  onGameVersionsChange: (value: string[]) => void;
  onLoadersChange: (value: string[]) => void;
  onNameChange: (value: string) => void;
  onVersionNumberChange: (value: string) => void;
}) {
  const activeGameVersions = gameVersionOptions.filter(
    (version) => version.isActive,
  );

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
            {VERSION_CHANNELS.map((value) => (
              <option key={value} value={value}>
                {channelLabel(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-3">
        <TaxonomyCheckboxGroup
          label="Loaders"
          options={SUPPORTED_LOADERS.map((loader) => ({
            label: enumLabel(loader),
            value: loader,
          }))}
          selected={loaders}
          onChange={onLoadersChange}
        />
        <TaxonomyCheckboxGroup
          label="Game versions"
          options={activeGameVersions.map((version) => ({
            label: version.version,
            value: version.version,
          }))}
          selected={gameVersions}
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

function channelLabel(channel: VersionChannel): string {
  return channel.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}
