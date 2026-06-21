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
  licenseOptions,
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
  selectedLicenses,
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
  toggleLicense,
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
      <header className="mb-5 border-b border-line pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink">
              {meta.label}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Find {meta.plural} by name, loader, game version, category, and
              license.
            </p>
          </div>
          <p className="text-sm font-semibold text-muted tabular-nums">
            {total.toLocaleString('en-US')}{' '}
            {total === 1 ? meta.singular : meta.plural}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          id="filters-panel"
          className={cn('lg:block', mobileFiltersOpen ? 'block' : 'hidden')}
        >
          <FilterSidebar
            tagOptions={tagOptions}
            versionOptions={versionOptions}
            loaderOptions={loaderOptions}
            licenseOptions={licenseOptions}
            categoryOptions={categoryOptions}
            selectedTags={selectedTags}
            selectedVersions={selectedVersions}
            selectedLoaders={selectedLoaders}
            selectedLicenses={selectedLicenses}
            selectedCategories={selectedCategories}
            onToggleTag={toggleTag}
            onToggleVersion={toggleVersion}
            onToggleLoader={toggleLoader}
            onToggleLicense={toggleLicense}
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
            licenseOptions={licenseOptions}
            query={query}
            selectedCategories={selectedCategories}
            selectedLicenses={selectedLicenses}
            selectedLoaders={selectedLoaders}
            selectedVersions={selectedVersions}
            setQuery={setQuery}
            toggleCategory={toggleCategory}
            toggleLicense={toggleLicense}
            toggleLoader={toggleLoader}
            toggleVersion={toggleVersion}
            versionOptions={versionOptions}
          />
          <DiscoverResults
            clearAll={clearAll}
            error={error}
            hasActiveFilters={hasActiveFilters}
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
