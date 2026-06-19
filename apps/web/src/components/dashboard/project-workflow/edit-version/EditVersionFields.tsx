import { SUPPORTED_LOADERS, VERSION_CHANNELS } from '@moddery/shared';

import { type GameVersionTaxonomy } from '../../../../lib/dashboard.ts';
import { enumLabel } from '../../../../lib/labels.ts';
import { TaxonomyCheckboxGroup } from '../../TaxonomyCheckboxGroup.tsx';
import { DashboardField } from '../shared.tsx';
import { type VersionChannel, versionStatusOptions } from './versionChannel.ts';

export function EditVersionFields({
  channel,
  changelog,
  featured,
  gameVersionOptions,
  gameVersions,
  loaders,
  name,
  requestedStatus,
  sortOrder,
  status,
  versionNumber,
  onChannelChange,
  onChangelogChange,
  onFeaturedChange,
  onGameVersionsChange,
  onLoadersChange,
  onNameChange,
  onRequestedStatusChange,
  onSortOrderChange,
  onStatusChange,
  onVersionNumberChange,
}: {
  channel: VersionChannel;
  changelog: string;
  featured: boolean;
  gameVersionOptions: GameVersionTaxonomy[];
  gameVersions: string[];
  loaders: string[];
  name: string;
  requestedStatus: string;
  sortOrder: string;
  status: string;
  versionNumber: string;
  onChannelChange: (value: VersionChannel) => void;
  onChangelogChange: (value: string) => void;
  onFeaturedChange: (value: boolean) => void;
  onGameVersionsChange: (value: string[]) => void;
  onLoadersChange: (value: string[]) => void;
  onNameChange: (value: string) => void;
  onRequestedStatusChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVersionNumberChange: (value: string) => void;
}) {
  const activeGameVersions = gameVersionOptions.filter(
    (version) => version.isActive,
  );

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(10rem,0.6fr)_minmax(8rem,0.4fr)]">
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
        <label className="grid gap-1 text-sm font-bold text-ink">
          Order
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold text-ink">
        <input
          type="checkbox"
          checked={featured}
          onChange={(event) => onFeaturedChange(event.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        Featured version
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Status
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {versionStatusOptions.map((value) => (
              <option key={value} value={value}>
                {enumLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Requested status
          <select
            value={requestedStatus}
            onChange={(event) => onRequestedStatusChange(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            <option value="">None</option>
            {versionStatusOptions.map((value) => (
              <option key={value} value={value}>
                {enumLabel(value)}
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
