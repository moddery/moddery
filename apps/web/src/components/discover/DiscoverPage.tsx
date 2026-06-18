import { cn } from '../../lib/cn.ts';
import { FilterSidebar } from '../FilterSidebar.tsx';
import { DiscoverActiveFilters } from './DiscoverActiveFilters.tsx';
import { DiscoverResults } from './DiscoverResults.tsx';
import { DiscoverToolbar } from './DiscoverToolbar.tsx';
import { type DiscoverPageProps } from './types.ts';

export function DiscoverPage({
  activeFilterCount,
  categoryOptions,
  clearAll,
  error,
  hasActiveFilters,
  layout,
  loaderOptions,
  loading,
  meta,
  mobileFiltersOpen,
  mods,
  onOpenProject,
  onPage,
  onTagSearch,
  page,
  query,
  selectedCategories,
  selectedLoaders,
  selectedTags,
  selectedVersions,
  setLayout,
  setMobileFiltersOpen,
  setQuery,
  setSort,
  setView,
  sort,
  tagOptions,
  toggleCategory,
  toggleLoader,
  toggleTag,
  toggleVersion,
  total,
  totalPages,
  versionOptions,
  view,
}: DiscoverPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          id="filters-panel"
          className={cn('lg:block', mobileFiltersOpen ? 'block' : 'hidden')}
        >
          <FilterSidebar
            tagOptions={tagOptions}
            versionOptions={versionOptions}
            loaderOptions={loaderOptions}
            categoryOptions={categoryOptions}
            selectedTags={selectedTags}
            selectedVersions={selectedVersions}
            selectedLoaders={selectedLoaders}
            selectedCategories={selectedCategories}
            onToggleTag={toggleTag}
            onToggleVersion={toggleVersion}
            onToggleLoader={toggleLoader}
            onToggleCategory={toggleCategory}
            onClearAll={clearAll}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        <section>
          <DiscoverToolbar
            activeFilterCount={activeFilterCount}
            layout={layout}
            meta={meta}
            mobileFiltersOpen={mobileFiltersOpen}
            query={query}
            setLayout={setLayout}
            setMobileFiltersOpen={setMobileFiltersOpen}
            setQuery={setQuery}
            setSort={setSort}
            setView={setView}
            sort={sort}
            total={total}
            view={view}
          />
          <DiscoverActiveFilters
            categoryOptions={categoryOptions}
            clearAll={clearAll}
            hasActiveFilters={hasActiveFilters}
            loaderOptions={loaderOptions}
            query={query}
            selectedCategories={selectedCategories}
            selectedLoaders={selectedLoaders}
            selectedVersions={selectedVersions}
            setQuery={setQuery}
            toggleCategory={toggleCategory}
            toggleLoader={toggleLoader}
            toggleVersion={toggleVersion}
            versionOptions={versionOptions}
          />
          <DiscoverResults
            clearAll={clearAll}
            error={error}
            layout={layout}
            loading={loading}
            meta={meta}
            mods={mods}
            onOpenProject={onOpenProject}
            onPage={onPage}
            onTagSearch={onTagSearch}
            page={page}
            total={total}
            totalPages={totalPages}
          />
        </section>
      </div>
    </main>
  );
}
