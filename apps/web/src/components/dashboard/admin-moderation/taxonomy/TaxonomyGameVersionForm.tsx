import { type FormEvent } from 'react';

import { type GameVersionTaxonomy } from '../../../../lib/dashboard.ts';
import { DashboardField } from '../shared.tsx';
import { TaxonomyList } from './TaxonomyList.tsx';

export function TaxonomyGameVersionForm({
  busy,
  gameVersion,
  gameVersionActive,
  gameVersions,
  onGameVersionActiveChange,
  onGameVersionChange,
  onSubmit,
}: {
  busy: boolean;
  gameVersion: string;
  gameVersionActive: boolean;
  gameVersions: GameVersionTaxonomy[];
  onGameVersionActiveChange: (value: boolean) => void;
  onGameVersionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid content-start gap-3">
      <h3 className="font-display text-base font-extrabold text-ink">
        Game version
      </h3>
      <DashboardField
        label="Version"
        value={gameVersion}
        onChange={onGameVersionChange}
        required
      />
      <label className="flex items-center gap-2 text-sm font-bold text-ink">
        <input
          type="checkbox"
          checked={gameVersionActive}
          onChange={(event) => onGameVersionActiveChange(event.target.checked)}
          className="size-4 accent-accent"
        />
        Active
      </label>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save game version
      </button>
      <TaxonomyList
        emptyLabel="No game versions yet."
        getKey={(item) => item.version}
        getSearchText={(item) =>
          `${item.version} ${item.isActive ? 'active' : 'inactive'}`
        }
        items={gameVersions}
        searchLabel="Search game versions..."
        renderItem={(item) => (
          <button
            type="button"
            onClick={() => {
              onGameVersionChange(item.version);
              onGameVersionActiveChange(item.isActive);
            }}
            className="flex w-full items-center justify-between rounded-lg border border-line bg-control px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-control-hover"
          >
            <span>{item.version}</span>
            <span className="text-xs text-muted">
              {item.isActive ? 'active' : 'inactive'}
            </span>
          </button>
        )}
      />
    </form>
  );
}
