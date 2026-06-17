import { Search } from 'lucide-react';

import { type SelectOption, SelectField } from '../../ui/Select.tsx';

export function VersionsToolbar({
  filteredCount,
  gameVersion,
  gameVersionOptions,
  loader,
  loaderOptions,
  query,
  totalCount,
  onGameVersionChange,
  onLoaderChange,
  onQueryChange,
}: {
  filteredCount: number;
  gameVersion: string;
  gameVersionOptions: SelectOption[];
  loader: string;
  loaderOptions: SelectOption[];
  query: string;
  totalCount: number;
  onGameVersionChange: (value: string) => void;
  onLoaderChange: (value: string) => void;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
      <span className="text-sm font-semibold text-muted">
        {filteredCount.toLocaleString('en-US')} of{' '}
        {totalCount.toLocaleString('en-US')} versions
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <label className="block w-full sm:w-56">
          <span className="sr-only">Search versions</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(event) => {
                onQueryChange(event.target.value);
              }}
              placeholder="Search versions..."
              className="h-9 w-full rounded-lg border border-line bg-control pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
            />
          </span>
        </label>
        <SelectField
          ariaLabel="Filter by game version"
          prefix="Version:"
          value={gameVersion}
          onValueChange={onGameVersionChange}
          options={gameVersionOptions}
          align="end"
          className="h-9"
        />
        <SelectField
          ariaLabel="Filter by loader"
          prefix="Loader:"
          value={loader}
          onValueChange={onLoaderChange}
          options={loaderOptions}
          align="end"
          className="h-9"
        />
      </div>
    </div>
  );
}
