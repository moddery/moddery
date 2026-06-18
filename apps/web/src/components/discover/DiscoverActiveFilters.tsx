import { X } from 'lucide-react';

import { categoryLabel, loaderLabel } from '../Chips.tsx';
import { type DiscoverPageProps } from './types.ts';

type DiscoverActiveFiltersProps = Pick<
  DiscoverPageProps,
  | 'categoryOptions'
  | 'clearAll'
  | 'hasActiveFilters'
  | 'loaderOptions'
  | 'query'
  | 'selectedCategories'
  | 'selectedLoaders'
  | 'selectedVersions'
  | 'setQuery'
  | 'toggleCategory'
  | 'toggleLoader'
  | 'toggleVersion'
  | 'versionOptions'
>;

export function DiscoverActiveFilters({
  categoryOptions,
  clearAll,
  hasActiveFilters,
  loaderOptions,
  query,
  selectedCategories,
  selectedLoaders,
  selectedVersions,
  setQuery,
  toggleCategory,
  toggleLoader,
  toggleVersion,
  versionOptions,
}: DiscoverActiveFiltersProps) {
  if (!hasActiveFilters) return null;

  const categoryLabels = labelMap(categoryOptions);
  const loaderLabels = labelMap(loaderOptions);
  const versionLabels = labelMap(versionOptions);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line/70 py-3">
      <span className="text-xs font-bold uppercase text-faint">Active</span>
      {query.trim() && (
        <FilterChip
          label={`Search: ${query.trim()}`}
          onRemove={() => setQuery('')}
        />
      )}
      {[...selectedCategories].sort().map((value) => (
        <FilterChip
          key={`category:${value}`}
          label={categoryLabels.get(value) ?? categoryLabel(value)}
          onRemove={() => toggleCategory(value)}
        />
      ))}
      {[...selectedLoaders].sort().map((value) => (
        <FilterChip
          key={`loader:${value}`}
          label={loaderLabels.get(value) ?? loaderLabel(value)}
          onRemove={() => toggleLoader(value)}
        />
      ))}
      {[...selectedVersions].sort().map((value) => (
        <FilterChip
          key={`version:${value}`}
          label={versionLabels.get(value) ?? value}
          onRemove={() => toggleVersion(value)}
        />
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="ml-auto text-xs font-bold text-ink transition-colors hover:text-accent-icon"
      >
        Clear all
      </button>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex h-8 max-w-full items-center gap-1 rounded-md bg-control px-2 text-xs font-semibold text-ink">
      <span className="truncate">{label}</span>
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="grid size-5 shrink-0 place-items-center rounded text-faint transition-colors hover:bg-control-hover hover:text-ink"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}

function labelMap(options: { label?: string; value: string }[]) {
  return new Map(
    options.map((option) => [option.value, option.label ?? option.value]),
  );
}
