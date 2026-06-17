import { lazy } from 'react';

import { projectTypeMeta } from '../../lib/projectTypes.ts';
import { type useAppShellState } from '../useAppShellState.ts';

const DiscoverPage = lazy(() =>
  import('../../components/discover/DiscoverPage.tsx').then((module) => ({
    default: module.DiscoverPage,
  })),
);

type AppShellState = ReturnType<typeof useAppShellState>;

type DiscoverRouteProps = {
  app: AppShellState;
};

export function DiscoverRoute({ app }: DiscoverRouteProps) {
  return (
    <DiscoverPage
      activeFilterCount={app.discover.activeFilterCount}
      categoryOptions={app.discover.categoryOptions}
      clearAll={app.discover.clearAll}
      error={app.discover.error}
      hasActiveFilters={app.discover.hasActiveFilters}
      layout={app.discover.layout}
      loaderOptions={app.discover.loaderOptions}
      loading={app.discover.loading}
      meta={projectTypeMeta(app.projectType)}
      mobileFiltersOpen={app.discover.mobileFiltersOpen}
      mods={app.discover.mods}
      onOpenProject={app.openProject}
      onPage={app.discover.setPage}
      onTagSearch={app.searchByTag}
      page={app.discover.page}
      query={app.discover.query}
      selectedCategories={app.discover.selectedCategories}
      selectedLoaders={app.discover.selectedLoaders}
      selectedTags={app.discover.selectedTags}
      selectedVersions={app.discover.selectedVersions}
      setLayout={app.discover.setLayout}
      setMobileFiltersOpen={app.discover.setMobileFiltersOpen}
      setQuery={(value) => {
        app.discover.setQuery(value);
        app.discover.setPage(1);
      }}
      setSort={(value) => {
        app.discover.setSort(value);
        app.discover.setPage(1);
      }}
      setView={(value) => {
        app.discover.setView(value);
        app.discover.setPage(1);
      }}
      sort={app.discover.sort}
      tagOptions={app.discover.tagOptions}
      toggleCategory={app.discover.toggleCategory}
      toggleLoader={app.discover.toggleLoader}
      toggleTag={app.discover.toggleTag}
      toggleVersion={app.discover.toggleVersion}
      total={app.discover.total}
      totalPages={app.discover.totalPages}
      versionOptions={app.discover.versionOptions}
      view={app.discover.view}
    />
  );
}
