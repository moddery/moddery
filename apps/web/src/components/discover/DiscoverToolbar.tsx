import { Filter, LayoutGrid, List } from 'lucide-react';

import { type SortKey } from '../../lib/catalog.ts';
import { SearchBar } from '../SearchBar.tsx';
import { SelectField, type SelectOption } from '../ui/Select.tsx';
import { LayoutButton } from './LayoutButton.tsx';
import { type DiscoverPageProps } from './types.ts';

const SORT_OPTIONS: SelectOption[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Downloads', value: 'downloads' },
  { label: 'Follows', value: 'follows' },
  { label: 'Recently updated', value: 'updated' },
  { label: 'Name (A-Z)', value: 'name' },
];

const VIEW_OPTIONS: SelectOption[] = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
];

type DiscoverToolbarProps = Pick<
  DiscoverPageProps,
  | 'activeFilterCount'
  | 'layout'
  | 'meta'
  | 'mobileFiltersOpen'
  | 'query'
  | 'setLayout'
  | 'setMobileFiltersOpen'
  | 'setQuery'
  | 'setSort'
  | 'setView'
  | 'sort'
  | 'total'
  | 'view'
>;

export function DiscoverToolbar({
  activeFilterCount,
  layout,
  meta,
  mobileFiltersOpen,
  query,
  setLayout,
  setMobileFiltersOpen,
  setQuery,
  setSort,
  setView,
  sort,
  total,
  view,
}: DiscoverToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
      <div className="min-w-[16rem] flex-1">
        <SearchBar
          value={query}
          placeholder={`Search ${meta.plural}...`}
          ariaLabel={`Search ${meta.plural}`}
          onChange={setQuery}
        />
      </div>

      <button
        type="button"
        onClick={() => setMobileFiltersOpen((open) => !open)}
        aria-expanded={mobileFiltersOpen}
        aria-controls="filters-panel"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover lg:hidden"
      >
        <Filter className="size-4 text-accent-icon" />
        Filters
        {activeFilterCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-accent text-xs font-bold text-white tabular-nums">
            {activeFilterCount}
          </span>
        )}
      </button>

      <SelectField
        ariaLabel="Sort results"
        prefix="Sort by:"
        value={sort}
        onValueChange={(value) => setSort(value as SortKey)}
        options={SORT_OPTIONS}
      />

      <SelectField
        ariaLabel="Results per page"
        prefix="View:"
        value={view}
        onValueChange={setView}
        options={VIEW_OPTIONS}
      />

      <div
        role="group"
        aria-label="Layout"
        className="flex items-center rounded-lg border border-line bg-control p-0.5"
      >
        <LayoutButton
          active={layout === 'list'}
          ariaLabel="List view"
          onClick={() => setLayout('list')}
        >
          <List className="size-4" />
        </LayoutButton>
        <LayoutButton
          active={layout === 'grid'}
          ariaLabel="Grid view"
          onClick={() => setLayout('grid')}
        >
          <LayoutGrid className="size-4" />
        </LayoutButton>
      </div>

      <span
        aria-live="polite"
        className="ml-auto text-sm font-semibold text-muted tabular-nums"
      >
        {total.toLocaleString('en-US')} {total === 1 ? 'result' : 'results'}
      </span>
    </div>
  );
}
