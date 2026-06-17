import { type SelectOption, SelectField } from '../../ui/Select.tsx';

export function VersionsToolbar({
  filteredCount,
  gameVersion,
  gameVersionOptions,
  loader,
  loaderOptions,
  totalCount,
  onGameVersionChange,
  onLoaderChange,
}: {
  filteredCount: number;
  gameVersion: string;
  gameVersionOptions: SelectOption[];
  loader: string;
  loaderOptions: SelectOption[];
  totalCount: number;
  onGameVersionChange: (value: string) => void;
  onLoaderChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
      <span className="text-sm font-semibold text-muted">
        {filteredCount.toLocaleString('en-US')} of{' '}
        {totalCount.toLocaleString('en-US')} versions
      </span>

      <div className="flex flex-wrap items-center gap-2">
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
